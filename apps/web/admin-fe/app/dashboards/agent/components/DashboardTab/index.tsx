'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Complaint {
  _id: string;
  text: string;
  createdAt: string;
  status: 'Pending' | 'Solved' | 'In Progress' | 'Escalated';
}

interface ComplaintDetail {
  id: string;
  seq: number;
  description: string;
  submissionDate: string;
  status: 'Pending' | 'Solved' | 'In Progress' | 'Escalated';
  urgency: string;
  assignedDepartment: string;
  categoryId: string;
  subCategory: string;
  standardizedSubCategory?: string;
  attachmentUrl?: string;
  sla?: string;
  upvoteCount: number;
  isPublic: boolean;
  escalationLevel?: string;
  dateOfResolution?: string;
  complainant?: {
    name: string;
    email: string;
  };
  category?: {
    name: string;
  };
  location?: {
    address: string;
    coordinates?: string;
  };
}

interface DashboardStats {
  totalComplaints: number;
  recent: Complaint[];
}

export default function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    recent: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | Complaint['status']>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
        const response = await fetch(`${API_BASE}/api/agent/complaints`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch complaints');

        const data = await response.json();

        const complaints: Complaint[] = data.complaints.map((c: any) => ({
          _id: c.id,
          text: c.description,
          createdAt: new Date(c.submissionDate).toLocaleString(),
          status: mapStatus(c.status),
        }));

        setStats({ totalComplaints: complaints.length, recent: complaints });
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const fetchComplaintDetails = async (complaintId: string) => {
    setModalLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
      const response = await fetch(`${API_BASE}/api/agent/complaints/${complaintId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch complaint details');

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch complaint details');
      }

      const complaint = data.complaint;
      const complaintDetail: ComplaintDetail = {
        id: complaint.id,
        seq: complaint.seq,
        description: complaint.description,
        submissionDate: new Date(complaint.submissionDate).toLocaleString(),
        status: mapStatus(complaint.status),
        urgency: complaint.urgency,
        assignedDepartment: complaint.assignedDepartment,
        categoryId: complaint.categoryId,
        subCategory: complaint.subCategory,
        standardizedSubCategory: complaint.standardizedSubCategory,
        attachmentUrl: complaint.attachmentUrl,
        sla: complaint.sla,
        upvoteCount: complaint.upvoteCount,
        isPublic: complaint.isPublic,
        escalationLevel: complaint.escalationLevel,
        dateOfResolution: complaint.dateOfResolution ? new Date(complaint.dateOfResolution).toLocaleString() : undefined,
        complainant: complaint.complainant,
        category: complaint.category,
        location: complaint.location,
      };

      setSelectedComplaint(complaintDetail);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleComplaintClick = (complaintId: string) => {
    fetchComplaintDetails(complaintId);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  const mapStatus = (status: string): Complaint['status'] => {
    switch (status) {
      case 'UNDER_PROCESSING':
        return 'In Progress';
      case 'RESOLVED':
        return 'Solved';
      case 'ESCALATED':
        return 'Escalated';
      default:
        return 'Pending';
    }
  };

  const groupedByStatus = stats.recent.reduce((acc: Record<string, Complaint[]>, complaint) => {
    acc[complaint.status] = acc[complaint.status] || [];
    acc[complaint.status].push(complaint);
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    Pending: 'text-yellow-300',
    Solved: 'text-green-300',
    Escalated: 'text-red-400',
    'In Progress': 'text-blue-300',
  };

  const urgencyColors: Record<string, string> = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-red-400',
    CRITICAL: 'text-red-600',
  };

  const filteredComplaints =
    filterStatus === 'All' ? stats.recent : stats.recent.filter((c) => c.status === filterStatus);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Complaints</h3>
          <p className="text-3xl font-bold text-white">{stats.totalComplaints}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Complaints by Status</h3>
          <div className="space-y-2">
            {Object.entries(groupedByStatus).map(([status, complaints]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className={`${statusColors[status] || 'text-white'}`}>{status}</span>
                <span className="text-gray-300">{complaints.length}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="mt-6 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Complaints</h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Solved">Solved</option>
            <option value="Escalated">Escalated</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <ul className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <li key={complaint._id} className="bg-gray-700 p-4 rounded-xl shadow space-y-2">
              <div>
                <p 
                  className="text-white text-sm font-medium cursor-pointer hover:text-blue-300 transition-colors"
                  onClick={() => handleComplaintClick(complaint._id)}
                >
                  {complaint.text}
                </p>
                <p className="text-xs text-gray-400">{complaint.createdAt}</p>
                <p className={`text-xs mt-1 font-semibold ${statusColors[complaint.status]}`}>
                  {complaint.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-[rgba(18,18,18,0.4)] backdrop-blur-md backdrop-saturate-150" />
            
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {modalLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-white">Loading complaint details...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Complaint Details</h2>
                      <p className="text-sm text-gray-400">ID: {selectedComplaint.seq}</p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                        <p className="text-white text-sm leading-relaxed">{selectedComplaint.description}</p>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Status & Priority</h3>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[selectedComplaint.status]} bg-opacity-20`}>
                            {selectedComplaint.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${urgencyColors[selectedComplaint.urgency]} bg-opacity-20`}>
                            {selectedComplaint.urgency}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Category</h3>
                        <p className="text-white text-sm">{selectedComplaint.category?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-xs mt-1">Sub: {selectedComplaint.subCategory}</p>
                        {selectedComplaint.standardizedSubCategory && (
                          <p className="text-gray-400 text-xs">Standardized: {selectedComplaint.standardizedSubCategory}</p>
                        )}
                      </div>

                      {selectedComplaint.location && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Location</h3>
                          <p className="text-white text-sm">{selectedComplaint.location.address}</p>
                          {selectedComplaint.location.coordinates && (
                            <p className="text-gray-400 text-xs mt-1">Coordinates: {selectedComplaint.location.coordinates}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Timeline</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Submitted:</span>
                            <span className="text-white">{selectedComplaint.submissionDate}</span>
                          </div>
                          {selectedComplaint.dateOfResolution && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Resolved:</span>
                              <span className="text-white">{selectedComplaint.dateOfResolution}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Assignment</h3>
                        <p className="text-white text-sm">{selectedComplaint.assignedDepartment}</p>
                        {selectedComplaint.sla && (
                          <p className="text-gray-400 text-xs mt-1">SLA: {selectedComplaint.sla}</p>
                        )}
                        {selectedComplaint.escalationLevel && (
                          <p className="text-yellow-400 text-xs mt-1">Escalation Level: {selectedComplaint.escalationLevel}</p>
                        )}
                      </div>

                      {selectedComplaint.complainant && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Complainant</h3>
                          <p className="text-white text-sm">{selectedComplaint.complainant.name}</p>
                          <p className="text-gray-400 text-xs">{selectedComplaint.complainant.email}</p>
                        </div>
                      )}

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Additional Info</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Upvotes:</span>
                            <span className="text-white">{selectedComplaint.upvoteCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Public:</span>
                            <span className="text-white">{selectedComplaint.isPublic ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>

                      {selectedComplaint.attachmentUrl && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Attachment</h3>
                          <a 
                            href={selectedComplaint.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}