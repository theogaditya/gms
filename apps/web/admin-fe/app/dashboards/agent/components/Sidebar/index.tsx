'use client';

import React from 'react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab,
  onLogout,
}: { 
  activeTab: 'dashboard' | 'complaints' | 'settings',
  setActiveTab: (tab: 'dashboard' | 'complaints' | 'settings') => void,
  onLogout: () => void,
}) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white border-r border-gray-800">
      <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-md">
        <h1 className="text-2xl font-semibold text-white tracking-wide">SwarajDesk Agent Portal</h1>
        <p className="text-sm text-gray-300 mt-1">
          Powered by <span className="font-medium text-blue-400">Swaraj AI</span>
          <br />
          <span className="italic text-green-400">Agent Dashboard:</span> Manage your assignments.
        </p>
      </div>
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
            activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
          </svg>
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => setActiveTab('complaints')}
          className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
            activeTab === 'complaints' ? 'bg-blue-700' : 'hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>My Complaints</span>
        </button>
        
        <div className="border-t border-gray-700 mt-4 pt-4">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}