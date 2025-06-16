'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AdminSkeletonRow from './AdminSkeletonRow'; 

interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  accessLevel: string;
  status: string;
}

export default function AgentsTab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:3002/api/municipal-admin"; // Updated endpoint

  const handleToggleAgentStatus = async (id: string) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;

    const newStatus = agent.status === 'Active' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        setAgents(prev => prev.map(a =>
          a.id === id ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() } : a
        ));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

useEffect(() => {
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        const formattedAgents = data.agents.map((agent: Agent) => ({
          ...agent,
          status: agent.status 
            ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1).toLowerCase()
            : 'Inactive' // Default value if status is missing
        }));
        setAgents(formattedAgents);
      } else {
        console.error('Failed to fetch agents:', data.message);
        setAgents([]); // Set empty array if request fails
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setAgents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  fetchAgents();
}, []);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Agent Accounts</h2>
        <Link href="/dashboards/municipal-admin/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            + New Agent
          </motion.button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {['Name', 'Email', 'Department', 'Access Level', 'Status', 'Actions'].map((head) => (
                <th key={head} className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <AdminSkeletonRow key={i} />)
              : agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 text-sm font-medium text-white">{agent.name}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{agent.email}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{agent.department}</td>
                    <td className="px-6 py-4 text-sm text-blue-100">{agent.accessLevel}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-100">
                      <button 
                        onClick={() => handleToggleAgentStatus(agent.id)} 
                        className={`mr-3 ${agent.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                      >
                        {agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
