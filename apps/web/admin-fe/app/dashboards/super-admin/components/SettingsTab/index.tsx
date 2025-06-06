'use client';

import { motion } from 'framer-motion';

export default function SettingsTab() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6">System Settings</h2>

      <div className="space-y-6">
        {/* Security Settings */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Security Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm text-blue-100">
              <input type="checkbox" className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
              <span>Enable Two-Factor Authentication</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-blue-100">
              <input type="checkbox" checked readOnly className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
              <span>Enforce Strong Password Policy</span>
            </label>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">System Preferences</h3>
          <label className="block text-sm font-medium text-blue-100 mb-1">Timezone</label>
          <select className="block w-full bg-gray-700 border-gray-600 text-white rounded-md p-2">
            <option>UTC</option>
            <option>IST (India Standard Time)</option>
            <option>EST (Eastern Standard Time)</option>
          </select>
        </div>

        <div className="pt-4 text-right">
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
            Save Settings
          </button>
        </div>
      </div>
    </motion.section>
  );
}