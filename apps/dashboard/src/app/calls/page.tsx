// src/app/calls/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
// Import the specific function and new type
import { getCallLogs, CallLogWithCustomer } from "../../services/call-logs-api";

// This is your UI component
function CallsPage() {
  const [callLogs, setCallLogs] = useState<CallLogWithCustomer[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLogWithCustomer | null>(
    null,
  );
  const [filterOutcome, setFilterOutcome] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data using our new service
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // This function now calls:
        // -> /src/services/call-logs-api.ts
        //   -> which calls /api/calls (your BFF)
        //     -> which calls Supabase
        const data = await getCallLogs();
        setCallLogs(data);
      } catch (err) {
        setError("Could not load call logs.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = callLogs.filter((log) => {
    const outcomeMatch =
      filterOutcome === "all" || log.outcome === filterOutcome;

    // Search now checks the customer name OR the transcript
    const customerName = log.customer?.name?.toLowerCase() || "";
    const transcript = log.transcript.toLowerCase();

    const searchMatch =
      customerName.includes(searchQuery.toLowerCase()) ||
      transcript.includes(searchQuery.toLowerCase());

    return outcomeMatch && searchMatch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <Header title="Call Logs" />

      {/* TODO: Add Search and Filter UI here */}
      <div className="flex space-x-4 text-black">
        <input
          type="text"
          placeholder="Search by name or transcript..."
          className="p-2 border rounded-md w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* You can add your filter dropdown here */}
      </div>

      {isLoading && (
        <div className="p-8 text-center text-gray-500">
          Loading call logs...
        </div>
      )}

      {error && <div className="p-8 text-red-500 font-bold">{error}</div>}

      {!isLoading && !error && (
        <div className="flex flex-col space-y-4">
          <p className="text-gray-500 mt-4">
            Displaying {filteredLogs.length} of {callLogs.length} call logs.
          </p>

          {/* Render the logs */}
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCall(log)}
            >
              <div className="flex justify-between">
                <span className="font-bold text-lg">
                  {log.customer?.name ||
                    log.customer?.phone ||
                    "Unknown Caller"}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(log.startTime).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 truncate">{log.transcript}</p>
              <div className="mt-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {log.outcome || "No Outcome"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Add a modal component to display 'selectedCall' */}
    </div>
  );
}

export default CallsPage;
