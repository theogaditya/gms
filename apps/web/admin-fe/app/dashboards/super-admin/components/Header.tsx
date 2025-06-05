'use client';

export default function Header({ activeTab }: { activeTab: string }) {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-white">
        {{
          dashboard: 'Super Admin Dashboard',
          admins: 'Admin Management',
        }[activeTab as keyof object] || 'Dashboard'}
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
  );
}