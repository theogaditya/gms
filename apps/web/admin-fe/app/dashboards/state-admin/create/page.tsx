'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Department =
  | 'INFRASTRUCTURE'
  | 'EDUCATION'
  | 'REVENUE'
  | 'HEALTH'
  | 'WATER_SUPPLY_SANITATION'
  | 'ELECTRICITY_POWER'
  | 'TRANSPORTATION'
  | 'MUNICIPAL_SERVICES'
  | 'POLICE_SERVICES'
  | 'ENVIRONMENT'
  | 'HOUSING_URBAN_DEVELOPMENT'
  | 'SOCIAL_WELFARE'
  | 'PUBLIC_GRIEVANCES';

export default function CreateAdmin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    officialEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    department: 'INFRASTRUCTURE' as Department,
    municipality: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Always create municipal admin
      const endpoint = 'http://localhost:3002/api/super-admin/create/municipal-admins';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to create admin');
      }

      router.push('/dashboards/super-admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-blue-200">Restricted access - Authorized personnel only</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Create New Municipal Admin</h2>
            <p className="text-blue-100 text-sm">Fill in the required details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/20 border border-red-700 text-red-200 p-3 rounded-md text-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Official Email</label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                >
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="EDUCATION">Education</option>
                  <option value="HEALTH">Health</option>
                  <option value="WATER_SUPPLY_SANITATION">Water Supply</option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="POLICE_SERVICES">Police Services</option>
                  <option value="ENVIRONMENT">Environment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Municipality</label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboards/state-admin')}
                className="bg-gray-700 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium shadow hover:shadow-blue-500/20 transition disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Admin'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Secure Admin System - Unauthorized access prohibited
        </div>
      </div>
    </div>
  );
}
