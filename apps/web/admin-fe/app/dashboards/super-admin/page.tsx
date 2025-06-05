'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import AdminsTab from './components/AdminsTab';
import Header from './components/Header';
import Footer from './components/Footer';

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
  const API_BASE = 'http://localhost:3002/api/super-admin';

  // Logout logic here
  function handleLogout() {
    localStorage.removeItem('authToken');
    router.push('/');
  }

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
        setAdmins(prev =>
          prev.map(a =>
            a.id === id
              ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() }
              : a
          )
        );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="ml-64 p-6">
        <Header activeTab={activeTab} />

        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'admins' && <AdminsTab />}

        <Footer />
      </main>
    </div>
  );
}
