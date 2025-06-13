'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('SUPER_ADMIN');
  const API_BASE = process.env.NEXT_PUBLIC_URL_ADMIN;
  console.log('API_BASE:', API_BASE);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpointMap: Record<string, string> = {
        SUPER_ADMIN: `${API_BASE}/api/super-admin/login`,
        DEPT_STATE_ADMIN: `${API_BASE}/api/state-admin/login`,
        DEPT_MUNICIPAL_ADMIN: `${API_BASE}/api/municipal-admin/login`,
        AGENT: `${API_BASE}/api/agent/login`,
      };
      
      const res = await fetch(endpointMap[role], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          officialEmail: email,
          password: password,
        }),
      });

      console.log('Endpoint:', endpointMap[role]);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const accessLevel = data.admin?.accessLevel || data.agent?.accessLevel;

      switch (accessLevel) {
        case 'SUPER_ADMIN':
          router.push('/dashboards/super-admin');
          break;
        case 'DEPT_STATE_ADMIN':
          router.push('/dashboards/state-admin');
          break;
        case 'DEPT_MUNICIPAL_ADMIN':
          router.push('/dashboards/municipal-admin');
          break;
        case 'AGENT':
          router.push('/dashboards/agent');
          break;
        default:
          throw new Error('Unauthorized access level');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-blue-100 text-sm mt-1">Restricted access • Authorized personnel only</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-900/20 border border-red-700 text-red-200 p-3 rounded-md text-sm">
                ⚠️ {error}
              </motion.div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sign in as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="DEPT_STATE_ADMIN">State Admin</option>
                <option value="DEPT_MUNICIPAL_ADMIN">Municipal Admin</option>
                <option value="AGENT">Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {role === 'AGENT' ? 'Agent Email' : 'Admin Email'}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                placeholder={role === 'AGENT' ? 'agent@company.com' : 'admin@company.com'}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-300">
                <input type="checkbox" className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600" /> <span className="ml-2">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access Dashboard'}
            </motion.button>
          </form>

          <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} SwarajDesk Admin System • Unauthorized access prohibited
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}