'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import AdminsTab from './components/AdminsTab';
import Header from './components/Header';
import Footer from './components/Footer';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admins' | 'settings'>('dashboard');
  // Logout logic here
  function handleLogout() {
    localStorage.removeItem('authToken');
    router.push('/');
  }

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
