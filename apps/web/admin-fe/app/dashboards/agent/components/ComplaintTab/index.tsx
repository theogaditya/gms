'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ComplaintSkeletonRow from './complaintSkeletonRow';

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

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:3002/api/agent"; // Updated endpoint for agent complaints

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
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
        return 'bg-green-900 text-green-200';
      case 'in_progress':
        return 'bg-blue-900 text-blue-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'rejected':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/me/complaints`, {
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
    };

    fetchComplaints();
  }, []);

  return (
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
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {['Title', 'Category', 'Priority', 'Status', 'Created At', 'Actions'].map((head) => (
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
                        {complaint.status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-100">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {complaint.status !== 'resolved' && (
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
                          onClick={() => {
                            // Add view details functionality
                            console.log('View details for:', complaint.id);
                          }}
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
  );
}