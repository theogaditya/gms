'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Complaint {
  id: string;
  seq: number;
  description: string;
  submissionDate: string;
  status: 'UNDER_PROCESSING' | 'RESOLVED' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categoryId: string;
  subCategory: string;
  standardizedSubCategory?: string;
  assignedDepartment: string;
  complainant?: {
    name: string;
    email: string;
  };
  category?: {
    name: string;
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
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | Complaint['status']>('All');
  const [filterUrgency, setFilterUrgency] = useState<'All' | Complaint['urgency']>('All');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'toggle';
    complaint: Complaint | null;
  }>({ type: 'delete', complaint: null });

  const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
  console.log('API_BASE:', API_BASE);

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/super-admin/complaints`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch complaints: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming the API returns an array of complaints
      const complaints = Array.isArray(data) ? data : data.complaints || [];
      
      setStats({
        totalComplaints: complaints.length,
        recent: complaints,
      });
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Group complaints by status for summary cards
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

  // Status to color map for cards
  const statusColors: Record<string, string> = {
    UNDER_PROCESSING: 'text-yellow-300',
    RESOLVED: 'text-green-300',
    ESCALATED: 'text-red-400',
    IN_PROGRESS: 'text-blue-300',
    CLOSED: 'text-gray-300',
  };

  // Status display names
  const statusDisplayNames: Record<string, string> = {
    UNDER_PROCESSING: 'Under Processing',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
    IN_PROGRESS: 'In Progress',
    CLOSED: 'Closed',
  };

  // Urgency colors
  const urgencyColors: Record<string, string> = {
    LOW: 'bg-green-600 text-green-100',
    MEDIUM: 'bg-yellow-600 text-yellow-100',
    HIGH: 'bg-orange-600 text-orange-100',
    CRITICAL: 'bg-red-600 text-red-100',
  };

  // Urgency display colors for summary
  const urgencyDisplayColors: Record<string, string> = {
    LOW: 'text-green-300',
    MEDIUM: 'text-yellow-300',
    HIGH: 'text-orange-300',
    CRITICAL: 'text-red-400',
  };

  // Filtered complaints based on selected filters
  const filteredComplaints = stats.recent.filter((complaint) => {
    const statusMatch = filterStatus === 'All' || complaint.status === filterStatus;
    const urgencyMatch = filterUrgency === 'All' || complaint.urgency === filterUrgency;
    return statusMatch && urgencyMatch;
  });

  // Delete complaint handler
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/super-admin/delete/${id}`, 
        {
          method: 'PATCH', 
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'DELETED' })  
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete complaint: ${response.status}`);
      }

      // Update local state
      const updated = stats.recent.filter(c => c.id !== id);
      setStats({ totalComplaints: updated.length, recent: updated });
      
    } catch (err) {
      console.error('Error deleting complaint:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete complaint');
    }
  };

  // Confirm popup open
  const confirmPopup = (complaint: Complaint, type: 'delete' | 'toggle') => {
    setConfirmAction({ complaint, type });
  };

  // Close confirm popup
  const closePopup = () => setConfirmAction({ type: 'delete', complaint: null });

  // Execute popup action
  const executePopupAction = async () => {
    if (!confirmAction.complaint) return;
    
    if (confirmAction.type === 'delete') {
      await handleDelete(confirmAction.complaint.id);
    }
    closePopup();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString; // fallback to original string if parsing fails
    }
  };

  // Complaint skeleton component
  const ComplaintSkeleton = () => (
    <div className="border-b border-gray-700 pb-4 mb-4 last:pb-0 last:mb-0 last:border-0 flex justify-between items-start animate-pulse">
      <div className="flex-1 mr-4">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <div className="h-6 bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-700 rounded w-20"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Skeleton for stat cards */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow animate-pulse">
          <div className="h-5 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Skeleton for complaints list */}
        <div className="md:col-span-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-700 rounded w-24 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <ComplaintSkeleton key={i} />
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="md:col-span-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <button
              onClick={fetchComplaints}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
    >
      {/* Total Complaints Card */}
      <StatCard title="Total Complaints" value={stats.totalComplaints.toString()} textColor="text-white" />

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
          <Link href="/dashboards/super-admin/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Create New Admin
            </motion.button>
          </Link>
          <Link href="https://insight.batoi.com/management/21/32e98cab-a41c-48f0-8804-d3f1b4ec1363">
            <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
              Batoi Insights
            </button>
          </Link>
          <button
            onClick={fetchComplaints}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filter dropdowns + Recent Complaints List */}
      <div className="md:col-span-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Complaints ({filteredComplaints.length})
          </h3>

          {/* Filter dropdowns */}
          <div className="flex space-x-2">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-700 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="UNDER_PROCESSING">Under Processing</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Urgency Filter */}
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

        {filteredComplaints.length === 0 ? (
          <p className="text-gray-400">No complaints found for selected filters.</p>
        ) : (
          filteredComplaints.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-700 pb-4 mb-4 last:pb-0 last:mb-0 last:border-0 flex justify-between items-start"
            >
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">#{item.seq}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${urgencyColors[item.urgency]}`}>
                    {item.urgency}
                  </span>
                </div>
                <p className="text-sm text-blue-100 mb-1">{item.description}</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Category: {item.category?.name || 'N/A'} - {item.subCategory}</p>
                  <p>Swaraj AI: {item.standardizedSubCategory}</p>
                  <p>Department: {item.assignedDepartment}</p>
                  <p>Submitted: {formatDate(item.submissionDate)}</p>
                  {item.complainant && (
                    <p>By: {item.complainant.name} ({item.complainant.email})</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    item.status === 'RESOLVED'
                      ? 'bg-green-700 text-green-100'
                      : item.status === 'UNDER_PROCESSING'
                      ? 'bg-yellow-600 text-yellow-100'
                      : item.status === 'ESCALATED'
                      ? 'bg-red-600 text-red-100'
                      : item.status === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-blue-100'
                      : 'bg-gray-600 text-gray-100'
                  }`}
                >
                  {statusDisplayNames[item.status] || item.status}
                </span>
                <button
                  onClick={() => confirmPopup(item, 'delete')}
                  className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.complaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          >
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg max-w-sm w-full">
              <h2 className="text-white text-lg font-semibold mb-3">
                Confirm{' '}
                {confirmAction.type === 'delete'
                  ? 'Deletion'
                  : confirmAction.complaint.status === 'ESCALATED'
                  ? 'De-Escalation'
                  : 'Escalation'}
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to{' '}
                {confirmAction.type === 'delete'
                  ? 'delete'
                  : confirmAction.complaint.status === 'ESCALATED'
                  ? 'de-escalate'
                  : 'escalate'}{' '}
                this complaint?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePopup}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={executePopupAction}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  textColor?: string;
}

function StatCard({ title, value, textColor = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${textColor}`}>{value}</p>
    </div>
  );
}