import React from 'react';
import Link from 'next/link';

const DashboardTab: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stat Cards */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-blue-200 font-medium">Total Admins</h3>
        <p className="text-3xl font-bold mt-2 text-white">24</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-blue-200 font-medium">Total Complaints</h3>
        <p className="text-3xl font-bold mt-2 text-white">8</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-blue-200 font-medium">System Health</h3>
        <p className="text-3xl font-bold mt-2 text-green-400">100%</p>
      </div>

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
        <div className="space-y-3 flex flex-col ">
          <Link href="/dashboards/super-admin/create">
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
              Create New Admin
            </button>
          </Link>
          <Link href={"https://insight.batoi.com/management/44/32e98cab-a41c-48f0-8804-d3f1b4ec1363"}>
            <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
              Show Reports
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DashboardTab;
