'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AdminSkeletonRow from './AdminSkeletonRow';

interface Admin {
  id: string;
  name: string;
  officialEmail: string;
  department: string;
  accessLevel: string;
  status: string;
}

export default function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:3002/api/state-admin";

  const handleDeactivateAdmin = async (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;

    const newStatus = admin.status === 'Active' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(`${API_BASE}/admins/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        setAdmins(prev => prev.map(a => 
          a.id === id ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() } : a
        ));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admins`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          const formattedAdmins = data.admins.map((admin: Admin) => ({
            ...admin,
            status: admin.status.charAt(0).toUpperCase() + admin.status.slice(1).toLowerCase()
          }));
          setAdmins(formattedAdmins);
        }
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Admin Accounts</h2>
        <Link href="/dashboards/state-admin/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            + New Admin
          </motion.button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {['Name', 'Email', 'Department', 'Access Level', 'Status', 'Actions'].map((head) => (
                <th key={head} className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <AdminSkeletonRow key={i} />)
              : admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 text-sm font-medium text-white">{admin.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{admin.officialEmail}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{admin.department}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{admin.accessLevel}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-100">
                      <button 
                        onClick={() => handleDeactivateAdmin(admin.id)} 
                        className={`mr-3 ${admin.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                      >
                        {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}