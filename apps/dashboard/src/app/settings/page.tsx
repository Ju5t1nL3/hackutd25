"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { useGoogleLogin } from "@react-oauth/google";

function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * This hook triggers the Google sign-in pop-up.
   * We are using the 'code' flow, which is the most secure.
   */
  const login = useGoogleLogin({
    // 1. This is the main callback
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        // 2. Send the one-time code to our backend API
        const response = await fetch("/api/auth/google/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: codeResponse.code }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to connect account.");
        }

        // 3. Handle success
        const data = await response.json();
        console.log("Successfully connected account:", data.email);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    // 4. This asks for the 'code' (for our backend) and 'calendar' access
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar",
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 text-gray-900">
      <Header title="Settings" />

      {/* Show feedback messages */}
      {isSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="font-medium text-green-800">
            Successfully connected your Google Account!
          </p>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="font-medium text-red-800">Error: {error}</p>
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Account Integration
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-700">Google Calendar/Auth</span>
            <button
              onClick={() => login()} // <-- 5. This triggers the pop-up
              disabled={isLoading || isSuccess}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Connecting..."
                : isSuccess
                  ? "Connected"
                  : "Connect Google Account"}
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
}

export default SettingsPage;
