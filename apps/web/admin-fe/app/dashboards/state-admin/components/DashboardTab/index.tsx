'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from './StatCard';
import Link from 'next/link';
import { Sparkles } from 'lucide-react'

interface Complaint {
  _id: string;
  text: string;
  createdAt: string;
  status:
    | 'Pending'
    | 'Solved'
    | 'In Progress'
    | 'Escalated'
    | 'Escalated to Municipal Level' 
    | 'On Hold'
    | 'Rejected' 
    | 'DELETED';
  subCategory: string;
  standardizedSubCategory?: string;
  urgency: string;
}

interface ComplaintDetail {
  id: string;
  seq: number;
  description: string;
  submissionDate: string;
  status:
    | 'Pending'
    | 'Solved'
    | 'In Progress'
    | 'Escalated'
    | 'Escalated to Municipal Level'
    | 'On Hold'
    | 'Rejected' 
    | 'DELETED';
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
  const [filterUrgency, setFilterUrgency] = useState<'All' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const mapStatus = (status: string): Complaint['status'] => {
    switch (status) {
      case 'REGISTERED':
        return 'Pending';
      case 'UNDER_PROCESSING':
        return 'In Progress';
      case 'ON_HOLD':
        return 'On Hold';
      case 'COMPLETED':
        return 'Solved';
      case 'REJECTED':
        return 'Rejected';
      case 'ESCALATED_TO_MUNICIPAL_LEVEL':
        return 'Escalated';
      case 'ESCALATED_TO_STATE_LEVEL':
        return 'Escalated';
      default:
        return 'DELETED';
    }
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
      const response = await fetch(`${API_BASE}/api/super-admin/complaints`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch complaints');

      const data = await response.json();

      const complaints: Complaint[] = data.complaints.map((c: any) => ({
        _id: c.id,
        text: c.description,
        createdAt: new Date(c.submissionDate).toLocaleString(),
        status: mapStatus(c.status),
        subCategory: c.subCategory,
        urgency: c.urgency,
      }));

      setStats({ totalComplaints: complaints.length, recent: complaints });
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
        status: complaint.status,
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
    setStatusDropdownOpen(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return;
    
    setIsUpdating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
      
      const isEscalation = newStatus === 'ESCALATED_TO_MUNICIPAL_LEVEL';

      const response = await fetch(`${API_BASE}/api/municipal-admin/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isEscalation
            ? { escalate: true }  
            : { status: newStatus }  
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      const updatedComplaint = data.complaint;
      setSelectedComplaint({
        ...selectedComplaint,
        status: mapStatus(updatedComplaint.status),
        dateOfResolution: updatedComplaint.dateOfResolution
          ? new Date(updatedComplaint.dateOfResolution).toLocaleString()
          : undefined,
      });

      await fetchComplaints();
      console.log('Status updated successfully');
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
      setStatusDropdownOpen(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchComplaints();
  };

  const getStatusOptions = () => [
    { value: 'REGISTERED', label: 'Pending', color: 'text-blue-400' },
    { value: 'UNDER_PROCESSING', label: 'In Progress', color: 'text-yellow-400' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'text-orange-400' },
    { value: 'COMPLETED', label: 'Solved', color: 'text-green-400' },
    { value: 'REJECTED', label: 'Rejected', color: 'text-red-400' },
  ];

  const groupedByStatus = stats.recent.reduce((acc: Record<string, Complaint[]>, complaint) => {
    acc[complaint.status] = acc[complaint.status] || [];
    acc[complaint.status].push(complaint);
    return acc;
  }, {});

  // Group complaints by urgency for summary
  const groupedByUrgency = stats.recent.reduce((acc: Record<string, Complaint[]>, complaint) => {
    acc[complaint.urgency] = acc[complaint.urgency] || [];
    acc[complaint.urgency].push(complaint);
    return acc;
  }, {});

  // Urgency display colors for summary
  const urgencyDisplayColors: Record<string, string> = {
    LOW: 'text-green-300',
    MEDIUM: 'text-yellow-300',
    HIGH: 'text-orange-300',
    CRITICAL: 'text-red-400',
  };

  const statusColors: Record<string, string> = {
    Pending: 'text-yellow-300',
    Solved: 'text-green-300',
    Escalated: 'text-red-400',
    'In Progress': 'text-blue-300',
    'On Hold': 'text-orange-300',
    Rejected: 'text-red-300',
    DELETED: 'text-gray-400',
  };

  const urgencyColors: Record<string, string> = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-red-400',
    CRITICAL: 'text-red-600',
  };
  
  // Status display names
  const statusDisplayNames: Record<string, string> = {
    UNDER_PROCESSING: 'Under Processing',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
    IN_PROGRESS: 'In Progress',
    CLOSED: 'Closed',
  };

  const filteredComplaints = stats.recent.filter((complaint) => {
    const statusMatch = filterStatus === 'All' || complaint.status === filterStatus;
    const urgencyMatch = filterUrgency === 'All' || complaint.urgency === filterUrgency;
    return statusMatch && urgencyMatch;
  });

  if (loading) return <p className="text-white">Loading...</p>;
  

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Total Complaints Card */}
        <StatCard title="Total Complaints" value={stats.totalComplaints.toString()} />

        {/* Status Summary Card */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
          <h3 className="text-sm font-medium text-gray-400 mb-3">By Status</h3>
          <div className="space-y-2">
            {Object.entries(groupedByStatus).map(([status, complaints]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className={`${statusColors[status] || 'text-white'}`}>
                  {statusDisplayNames[status] || status}
                </span>
                <span className="text-gray-300">{complaints.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Summary Card */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
          <h3 className="text-sm font-medium text-gray-400 mb-3">By Priority</h3>
          <div className="space-y-2">
            {Object.entries(groupedByUrgency).map(([urgency, complaints]) => (
              <div key={urgency} className="flex justify-between text-sm">
                <span className={`${urgencyDisplayColors[urgency] || 'text-white'}`}>
                  {urgency.charAt(0) + urgency.slice(1).toLowerCase()}
                </span>
                <span className="text-gray-300">{complaints.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3 flex flex-col">
            <Link href="https://insight.batoi.com/management/21/32e98cab-a41c-48f0-8804-d3f1b4ec1363">
              <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                Batoi Insights
              </button>
            </Link>
            <button
              onClick={handleRefresh}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Complaints</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Solved">Solved</option>
              <option value="Escalated">Escalated</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as any)}
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
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
                <p className={`text-xs mt-1 font-semibold ${urgencyColors[complaint.urgency]}`}>
                  Priority: {complaint.urgency}
                </p>
                <p className="text-xs text-gray-400">Sub Category: {complaint.subCategory}</p>
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
                    <div className="flex items-center gap-3">                      
                      {/* Status Update Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                          disabled={isUpdating}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {isUpdating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          {isUpdating ? 'Updating...' : 'Update Status'}
                          <svg className={`w-4 h-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {statusDropdownOpen && !isUpdating && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10"
                            >
                              <div className="py-1">
                                {getStatusOptions().map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors ${option.color}`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                  </div>

                  {/* Content Grid - Same as before */}
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
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedComplaint.status]} bg-gray-600`}>
                            {selectedComplaint.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColors[selectedComplaint.urgency]} bg-gray-600`}>
                            {selectedComplaint.urgency}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Category</h3>
                        <p className="text-white text-sm">{selectedComplaint.category?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-xs mt-1">Sub Category: {selectedComplaint.subCategory}</p>
                        {selectedComplaint.standardizedSubCategory && (
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-gray-400" />
                            Swaraj AI: {selectedComplaint.standardizedSubCategory}
                          </p>
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