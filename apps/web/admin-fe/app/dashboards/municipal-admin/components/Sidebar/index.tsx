'use client';

import React from 'react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab,
  onLogout,
}: { 
  activeTab: 'dashboard' | 'admins' | 'settings',
  setActiveTab: (tab: 'dashboard' | 'admins' | 'settings') => void,
  onLogout: () => void,
}) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white border-r border-gray-800">
      <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-md">
        <h1 className="text-2xl font-semibold text-white tracking-wide">SwarajDesk Admin Portal</h1>
        <p className="text-sm text-gray-300 mt-1">
          Powered by <span className="font-medium text-blue-400">Swaraj AI</span>
          <br />
          <span className="italic text-red-400">Restricted access:</span> Authorized personnel only.
        </p>
      </div>
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full text-left px-4 py-2 rounded-lg transition ${
            activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-gray-800'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`w-full text-left px-4 py-2 rounded-lg transition ${
            activeTab === 'admins' ? 'bg-blue-700' : 'hover:bg-gray-800'
          }`}
        >
          Agent Management
        </button>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}