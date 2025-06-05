import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'admins' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'admins' | 'settings') => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Portal</h1>
        <p className="text-blue-100 text-sm">Restricted access - Authorized personnel only</p>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {['dashboard', 'admins'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'dashboard' | 'admins' | 'settings')}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === tab ? 'bg-blue-700' : 'hover:bg-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full text-center px-4 py-2 rounded-lg bg-red-400 hover:bg-red-500 transition text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
