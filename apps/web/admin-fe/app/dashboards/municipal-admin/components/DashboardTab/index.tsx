'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
  const [filterStatus, setFilterStatus] = useState<'All' | Complaint['status']>('All');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalComplaintId, setModalComplaintId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'escalate' | 'de-escalate' | null>(null);

  useEffect(() => {
    // Mock fetch complaints
    const mockComplaints: Complaint[] = [
      { _id: '1', text: 'WiFi not working in hostel block B', createdAt: new Date().toLocaleString(), status: 'Pending' },
      { _id: '2', text: 'Water leakage in lab 203', createdAt: new Date().toLocaleString(), status: 'Solved' },
      { _id: '3', text: 'Air conditioner not functioning', createdAt: new Date().toLocaleString(), status: 'Escalated' },
      { _id: '4', text: 'Projector is flickering', createdAt: new Date().toLocaleString(), status: 'In Progress' },
    ];

    setStats({ totalComplaints: mockComplaints.length, recent: mockComplaints });
    setLoading(false);
  }, []);

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

  const filteredComplaints =
    filterStatus === 'All' ? stats.recent : stats.recent.filter((c) => c.status === filterStatus);

  // When escalate/de-escalate button is clicked, show modal popup
  const handleRequestToggleEscalation = (id: string) => {
    const complaint = stats.recent.find(c => c._id === id);
    if (!complaint) return;

    const action = complaint.status === 'Escalated' ? 'de-escalate' : 'escalate';
    setModalComplaintId(id);
    setModalAction(action);
    setModalVisible(true);
  };

  // Confirm escalation change
  const handleConfirmToggleEscalation = () => {
    if (!modalComplaintId || !modalAction) return;

    const updated = stats.recent.map(c =>
      c._id === modalComplaintId
        ? {
            ...c,
            status: (modalAction === 'escalate' ? 'Escalated' : 'Pending') as Complaint['status'],
          }
        : c
    );

    setStats({ totalComplaints: updated.length, recent: updated });
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalComplaintId(null);
    setModalAction(null);
  };

  const handleStatusChange = (id: string, newStatus: Complaint['status']) => {
    const updated = stats.recent.map(c =>
      c._id === id ? { ...c, status: newStatus } : c
    );
    setStats({ totalComplaints: updated.length, recent: updated });
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard title="Total Complaints" value={stats.totalComplaints.toString()} textColor="text-white" />

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

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3 flex flex-col">
            <Link href="/dashboards/municipal-admin/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
              >
                Create New Agent
              </motion.button>
            </Link>
               <Link href="https://insight.batoi.com/management/44/32e98cab-a41c-48f0-8804-d3f1b4ec1363">
            <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
              View Reports
            </button>
          </Link>
          </div>
        </div>

        <div className="md:col-span-3 bg-gray-800 p-6 rounded-xl border border-gray-700 mt-6">
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
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{complaint.text}</p>
                    <p className="text-xs text-gray-400">{complaint.createdAt}</p>
                    <p className={`text-xs mt-1 font-semibold ${statusColors[complaint.status]}`}>
                      {complaint.status}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleRequestToggleEscalation(complaint._id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      {complaint.status === 'Escalated' ? 'De-escalate' : 'Escalate'}
                    </button>

                    <select
                      className="text-xs bg-gray-600 text-white rounded px-2 py-1"
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value as Complaint['status'])}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Solved">Solved</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalVisible && modalComplaintId && modalAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          >
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg max-w-sm w-full">
              <h2 className="text-white text-lg font-semibold mb-3">
                Confirm {modalAction === 'de-escalate' ? 'De-Escalation' : 'Escalation'}
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to {modalAction === 'de-escalate' ? 'de-escalate' : 'escalate'} this complaint?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggleEscalation}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({
  title,
  value,
  textColor,
}: {
  title: string;
  value: string;
  textColor: string;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${textColor}`}>{value}</p>
    </div>
  );
}
