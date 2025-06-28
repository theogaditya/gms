'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintSkeletonRow from './complaintSkeletonRow';
import { Sparkles } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  citizenName?: string;
  citizenEmail?: string;
  assignedAgentId: string;
}

interface ComplaintDetail {
  id: string;
  seq: number;
  description: string;
  submissionDate: string;
  status: string;
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

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN; 

  const mapStatus = (status: string): string => {
    switch (status) {
      case 'REGISTERED':
        return 'Pending';
      case 'UNDER_PROCESSING':
        return 'In Progress';
      case 'ON_HOLD':
        return 'On Hold';
      case 'COMPLETED':
        return 'Resolved';
      case 'REJECTED':
        return 'Rejected';
      case 'ESCALATED_TO_MUNICIPAL_LEVEL':
        return 'Escalated';
      default:
        return status;
    }
  };

  const reverseMapStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'REGISTERED';
      case 'in progress':
        return 'UNDER_PROCESSING';
      case 'on hold':
        return 'ON_HOLD';
      case 'resolved':
        return 'COMPLETED';
      case 'rejected':
        return 'REJECTED';
      case 'escalated':
        return 'ESCALATED_TO_MUNICIPAL_LEVEL';
      default:
        return status;
    }
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/agent/me/complaints`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data || []);
      } else {
        console.error('Failed to fetch complaints:', data.message);
        setComplaints([]);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const fetchComplaintDetails = async (complaintId: string) => {
    setModalLoading(true);
    try {
      const API_BASE_ADMIN = process.env.NEXT_PUBLIC_URL_ADMIN;
      const response = await fetch(`${API_BASE_ADMIN}/api/agent/complaints/${complaintId}`, {
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
      alert('Failed to load complaint details');
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

  const handleUpdateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        setComplaints(prev => prev.map(complaint =>
          complaint.id === id ? { ...complaint, status: newStatus } : complaint
        ));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return;
    
    setIsUpdating(true);
    try {
      const API_BASE_ADMIN = process.env.NEXT_PUBLIC_URL_ADMIN;
      
      const isEscalation = newStatus === 'ESCALATED_TO_MUNICIPAL_LEVEL';

      const response = await fetch(`${API_BASE_ADMIN}/api/agent/complaints/${selectedComplaint.id}/status`, {
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
        status: updatedComplaint.status,
        dateOfResolution: updatedComplaint.dateOfResolution
          ? new Date(updatedComplaint.dateOfResolution).toLocaleString()
          : undefined,
      });

      // Refresh the complaints list
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

  const handleEscalate = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      const API_BASE_ADMIN = process.env.NEXT_PUBLIC_URL_ADMIN;

      const response = await fetch(`${API_BASE_ADMIN}/api/agent/complaints/${selectedComplaint.id}/escalate`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Escalation failed');
      }

      setSelectedComplaint({
        ...selectedComplaint,
        status: data.complaint.status,
      });

      await fetchComplaints();
      console.log('Escalation successful');
    } catch (err: any) {
      console.error('Escalation error:', err);
      alert(`Escalation failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusOptions = () => [
    { value: 'REGISTERED', label: 'Pending', color: 'text-blue-400' },
    { value: 'UNDER_PROCESSING', label: 'In Progress', color: 'text-yellow-400' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'text-orange-400' },
    { value: 'COMPLETED', label: 'Resolved', color: 'text-green-400' },
    { value: 'REJECTED', label: 'Rejected', color: 'text-red-400' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-900 text-red-200';
      case 'medium':
        return 'bg-yellow-900 text-yellow-200';
      case 'low':
        return 'bg-green-900 text-green-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'completed':
        return 'bg-green-900 text-green-200';
      case 'in_progress':
      case 'under_processing':
        return 'bg-blue-900 text-blue-200';
      case 'pending':
      case 'registered':
        return 'bg-yellow-900 text-yellow-200';
      case 'rejected':
        return 'bg-red-900 text-red-200';
      case 'escalated':
      case 'escalated_to_municipal_level':
        return 'bg-purple-900 text-purple-200';
      case 'on_hold':
        return 'bg-orange-900 text-orange-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const statusColors: Record<string, string> = {
    'REGISTERED': 'text-yellow-300',
    'UNDER_PROCESSING': 'text-blue-300',
    'ON_HOLD': 'text-orange-300',
    'COMPLETED': 'text-green-300',
    'REJECTED': 'text-red-300',
    'ESCALATED_TO_MUNICIPAL_LEVEL': 'text-purple-300',
  };

  const urgencyColors: Record<string, string> = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-red-400',
    CRITICAL: 'text-red-600',
  };

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <>
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Assigned Complaints</h2>
            <p className="text-sm text-gray-400 mt-1">
              Total: {complaints.length} complaints assigned to you
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <select 
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600"
              onChange={(e) => {
                // Add filter functionality here if needed
                console.log('Filter by:', e.target.value);
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {['Title', 'Category', 'Priority', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <ComplaintSkeletonRow key={i} />)
                : complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {complaint.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          {complaint.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-100">
                        {complaint.category || 'General'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {mapStatus(complaint.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          {complaint.status !== 'resolved' && complaint.status !== 'COMPLETED' && (
                            <select
                              className="bg-gray-700 text-white px-2 py-1 rounded text-xs border border-gray-600"
                              value={complaint.status}
                              onChange={(e) => handleUpdateComplaintStatus(complaint.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          )}
                          <button 
                            className="text-blue-400 hover:text-blue-300 text-xs"
                            onClick={() => handleComplaintClick(complaint.id)}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          
          {!loading && complaints.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No complaints assigned to you yet.</p>
            </div>
          )}
        </div>
      </motion.section>

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
                      {/* Escalate Button */}
                      <button
                        onClick={handleEscalate}
                        disabled={isUpdating}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Escalate to Municipal Level
                      </button>
                      
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