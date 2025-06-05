import React from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  department: string;
  accessLevel: string;
  status: string;
}

interface AdminsTabProps {
  admins: Admin[];
  loading: boolean;
  onToggleStatus: (id: string) => void;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ admins, loading, onToggleStatus }) => {
  return (
    <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Admin Accounts</h2>
        <a
          href="/dashboards/super-admin/create"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
        >
          Create Admin
        </a>
      </div>
      <div className="p-6 overflow-x-auto">
        {loading ? (
          <p className="text-white">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-gray-400">No admins found.</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs uppercase bg-gray-700 text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Department</th>
                <th scope="col" className="px-6 py-3">Access Level</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{admin.name}</td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">{admin.department}</td>
                  <td className="px-6 py-4">{admin.accessLevel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(admin.id)}
                      className="text-sm text-blue-400 hover:text-blue-200"
                    >
                      {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminsTab;
