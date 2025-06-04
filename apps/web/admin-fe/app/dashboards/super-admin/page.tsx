'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  department: string;
  accessLevel: string;
  status: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admins' | 'settings'>('dashboard');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:3002/api/super-admin";

  const handleDeactivateAdmin = async (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;

    const newStatus = admin.status === 'Active' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(`${API_BASE}/admins/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials:'include'
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
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admins`,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials:'include',
      });
      const data = await res.json();
      if (data.success) {
        // Capitalize status for display
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <p className="text-blue-100 text-sm">Restricted access - Authorized personnel only</p>
        </div>
        <nav className="p-4 space-y-2">
          {['dashboard', 'admins', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === tab ? 'bg-blue-700' : 'hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {{
              dashboard: 'Super Admin Dashboard',
              admins: 'Admin Management',
              settings: 'System Settings',
            }[activeTab]}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14v-3a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
              </svg>
            </button>
            <div className="bg-gray-800 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Conditional Tab Content */}
        {activeTab === 'dashboard' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Admins" value="24" />
            <StatCard title="Total Complaints" value="8" />
            <StatCard title="System Health" value="100%" color="text-green-400" />

            {/* Recent Activity */}
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border-b border-gray-700 pb-4 last:pb-0 last:border-0">
                    <p className="text-sm text-blue-100">Admin created new department policy</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
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
                <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                  Generate Reports
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === 'admins' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Admin Accounts</h2>
              <Link href="/dashboards/super-admin/create">
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
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 text-sm font-medium text-white">{admin.name}</td>
                      <td className="px-6 py-4 text-sm text-blue-100">{admin.email}</td>
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
                        <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                        <button 
                          onClick={() => handleDeactivateAdmin(admin.id)} 
                          className={`mr-3 ${admin.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                        >
                          {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {activeTab === 'settings' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">System Settings</h2>

            {/* Sample Settings Section */}
            <div className="space-y-6">
              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Security Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-2 text-sm text-blue-100">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                    <span>Enable Two-Factor Authentication</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-blue-100">
                    <input type="checkbox" checked readOnly className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                    <span>Enforce Strong Password Policy</span>
                  </label>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">System Preferences</h3>
                <label className="block text-sm font-medium text-blue-100 mb-1">Timezone</label>
                <select className="block w-full bg-gray-700 border-gray-600 text-white rounded-md p-2">
                  <option>UTC</option>
                  <option>IST (India Standard Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                </select>
              </div>

              <div className="pt-4 text-right">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.section>
        )}

        <footer className="mt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Secure Admin System - Unauthorized access prohibited
        </footer>
      </main>
    </div>
  );
}

function StatCard({ title, value, color = 'text-white' }: { title: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-blue-200 font-medium">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}