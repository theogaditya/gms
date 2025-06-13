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

type AccessLevel = 'DEPT_MUNICIPAL_ADMIN' | 'DEPT_STATE_ADMIN';

export default function CreateAgent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    officialEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    department: 'INFRASTRUCTURE' as Department,
    municipality: '',
    accessLevel: 'AGENT' as const,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/municipal-admin/create/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to create agent');
      }

      router.push('/dashboards/municipal-admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">👤 Create New Agent</h1>
          <p className="text-blue-200 mt-2">Fill out the form to onboard a new municipal or department-level agent.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-800/30 text-red-200 border border-red-600 px-4 py-2 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Full Name', 'fullName'],
                ['Email', 'email'],
                ['Official Email', 'officialEmail'],
                ['Phone Number', 'phoneNumber'],
                ['Password', 'password'],
                ['Confirm Password', 'confirmPassword'],
                ['Municipality', 'municipality'],
              ].map(([label, name]) => (
                <div key={name}>
                  <label className="block mb-1 text-sm font-medium text-blue-200">{label}</label>
                  <input
                    type={name.toLowerCase().includes('password') ? 'password' : name.includes('email') ? 'email' : 'text'}
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg px-4 py-2 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block mb-1 text-sm font-medium text-blue-200">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 bg-gray-700 text-white border border-gray-600"
                >
                  {[
                    'INFRASTRUCTURE', 'EDUCATION', 'REVENUE', 'HEALTH', 'WATER_SUPPLY_SANITATION',
                    'ELECTRICITY_POWER', 'TRANSPORTATION', 'MUNICIPAL_SERVICES', 'POLICE_SERVICES',
                    'ENVIRONMENT', 'HOUSING_URBAN_DEVELOPMENT', 'SOCIAL_WELFARE', 'PUBLIC_GRIEVANCES',
                  ].map(dep => (
                    <option key={dep} value={dep}>{dep.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}