'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import ComplaintsTab from './components/ComplaintTab';
import Header from './components/Header';
import Footer from './components/Footer';

export default function AgentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'settings'>('dashboard');

  function handleLogout() {
    // Clear agent authentication token
    localStorage.removeItem('agentAuthToken');
    // You might also want to clear other agent-specific data
    localStorage.removeItem('agentData');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="ml-64 p-6">
        <Header activeTab={activeTab} />

        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'complaints' && <ComplaintsTab />}
        <Footer />
      </main>
    </div>
  );
}