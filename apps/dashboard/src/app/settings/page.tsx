// src/pages/Settings.tsx

import React from "react";
import Header from "../../components/Header";

const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 space-y-8">
      <Header title="Settings" />

      <div className="space-y-6">
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Account Integration
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-700">Google Calendar/Auth</span>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out">
              Connect Google Account
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Required for scheduling meetings and generating calendar invites.
          </p>
        </section>

        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            AI Agent Preferences
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-700">Auto-Schedule Meetings</span>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              defaultChecked
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">Require Email Capture</span>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              defaultChecked
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
