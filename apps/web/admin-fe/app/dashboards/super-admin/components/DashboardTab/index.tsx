'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Complaint {
  _id: string;
  text: string;
  createdAt: string;
  status: 'Pending' | 'Solved' | 'In Progress' | 'Escalated';
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
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Complaint['status']>('All'); // Added filter state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'toggle';
    complaint: Complaint | null;
  }>({ type: 'delete', complaint: null });

  const router = useRouter();

  useEffect(() => {
    // Mock data loading
    const loadMockData = () => {
      const mockComplaints: Complaint[] = [
        {
          _id: '1',
          text: 'WiFi not working in hostel block B',
          createdAt: new Date().toLocaleString(),
          status: 'Pending',
        },
        {
          _id: '2',
          text: 'Water leakage in lab 203',
          createdAt: new Date().toLocaleString(),
          status: 'Solved',
        },
        {
          _id: '3',
          text: 'Air conditioner not functioning',
          createdAt: new Date().toLocaleString(),
          status: 'Escalated',
        },
        {
          _id: '4',
          text: 'Projector is flickering',
          createdAt: new Date().toLocaleString(),
          status: 'In Progress',
        },
      ];

      setStats({
        totalComplaints: mockComplaints.length,
        recent: mockComplaints,
      });

      setLoading(false);
    };

    loadMockData();
  }, []);

  // Group complaints by status for summary cards
  const groupedByStatus = stats.recent.reduce((acc: Record<string, Complaint[]>, complaint) => {
    acc[complaint.status] = acc[complaint.status] || [];
    acc[complaint.status].push(complaint);
    return acc;
  }, {});

  // Status to color map for cards
  const statusColors: Record<string, string> = {
    Pending: 'text-yellow-300',
    Solved: 'text-green-300',
    Escalated: 'text-red-400',
    'In Progress': 'text-blue-300',
  };

  // Filtered complaints based on selected filter
  const filteredComplaints =
    filterStatus === 'All'
      ? stats.recent
      : stats.recent.filter((c) => c.status === filterStatus);

  // Delete complaint handler
  const handleDelete = (id: string) => {
    const updated = stats.recent.filter(c => c._id !== id);
    setStats({ totalComplaints: updated.length, recent: updated });
  };

  // Toggle escalation handler (Escalate <-> De-Escalate = Pending)
  const handleToggleEscalation = (id: string) => {
    const updated = stats.recent.map(c =>
      c._id === id
        ? {
            ...c,
            status: c.status === 'Escalated' ? 'Pending' : 'Escalated' as Complaint['status'],
          }
        : c
    );
    setStats({ totalComplaints: updated.length, recent: updated });
  };

  // Confirm popup open
  const confirmPopup = (complaint: Complaint, type: 'delete' | 'toggle') => {
    setConfirmAction({ complaint, type });
  };

  // Close confirm popup
  const closePopup = () => setConfirmAction({ type: 'delete', complaint: null });

  // Execute popup action
  const executePopupAction = () => {
    if (!confirmAction.complaint) return;
    if (confirmAction.type === 'delete') {
      handleDelete(confirmAction.complaint._id);
    } else if (confirmAction.type === 'toggle') {
      handleToggleEscalation(confirmAction.complaint._id);
    }
    closePopup();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Total Complaints Card */}
      <StatCard title="Total Complaints" value={stats.totalComplaints.toString()} textColor="text-white" />

      {/* Status Summary Card */}
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

      {/* Quick Actions */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link href="/dashboards/super-admin/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Create New Admin
            </motion.button>
          </Link>
          <Link href="/complaints">
            <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
              View All Complaints
            </button>
          </Link>
        </div>
      </div>

      {/* Filter dropdown + Recent Complaints List */}
      <div className="md:col-span-3 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Complaints</h3>

          {/* Filter select */}
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

        {filteredComplaints.length === 0 ? (
          <p className="text-gray-400">No complaints found for selected filter.</p>
        ) : (
          filteredComplaints.map(item => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-700 pb-4 last:pb-0 last:border-0 flex justify-between items-start"
            >
              <div>
                <p className="text-sm text-blue-100">{item.text}</p>
                <p className="text-xs text-gray-400 mt-1">{item.createdAt}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    item.status === 'Solved'
                      ? 'bg-green-700 text-green-100'
                      : item.status === 'Pending'
                      ? 'bg-yellow-600 text-yellow-100'
                      : item.status === 'Escalated'
                      ? 'bg-red-600 text-red-100'
                      : 'bg-blue-600 text-blue-100'
                  }`}
                >
                  {item.status}
                </span>
                <button
                  onClick={() => confirmPopup(item, 'toggle')}
                  className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-orange-600 transition"
                >
                  {item.status === 'Escalated' ? 'De-Escalate' : 'Escalate'}
                </button>
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
                  : confirmAction.complaint.status === 'Escalated'
                  ? 'De-Escalation'
                  : 'Escalation'}
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to{' '}
                {confirmAction.type === 'delete'
                  ? 'delete'
                  : confirmAction.complaint.status === 'Escalated'
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
