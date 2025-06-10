'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
        const response = await fetch(`${API_BASE}/api/agent/complaints`, {
          credentials: 'include', // Needed if you're using cookies
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
                <p className="text-white text-sm font-medium">{complaint.text}</p>
                <p className="text-xs text-gray-400">{complaint.createdAt}</p>
                <p className={`text-xs mt-1 font-semibold ${statusColors[complaint.status]}`}>
                  {complaint.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
