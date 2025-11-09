// src/app/calls/page.tsx
"use client";

import { useState, useEffect } from "react";
// --- FIXED IMPORTS (reverted to relative paths) ---
import Header from "../../components/Header";
import OpportunityGraph from "../../components/OpportunityGraph"; // <-- Import new component
import { getCallLogs, CallLogWithCustomer } from "../../services/call-logs-api";
import { services, GraphRequest } from "../../services";
import { GraphResponse, BestMatch, GraphData } from "../../services/graph-api";
// ---

// --- Helper function for formatting time ---
function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} min ${secs} sec`;
}

// --- Call Log Modal Component ---
interface CallLogModalProps {
  log: CallLogWithCustomer;
  onClose: () => void;
}

function CallLogModal({ log, onClose }: CallLogModalProps) {
  // (This component is unchanged)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">Call Details</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
          <dl className="space-y-4">
            {/* Customer Details */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {log.customer?.name || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-gray-900">
                {log.customer?.phone || "Not available"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900">
                {log.customer?.email || "Not available"}
              </dd>
            </div>

            {/* Call Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(log.startTime).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(log.startTime).toLocaleTimeString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDuration(log.duration)}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Outcome</dt>
              <dd className="mt-1">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {log.outcome || "No Outcome"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-gray-900">{log.notes || "No notes"}</dd>
            </div>

            {/* Transcript */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Transcript</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-gray-700">
                {log.transcript}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED Graph Modal Component ---
interface GraphModalProps {
  data: GraphResponse;
  onClose: () => void;
}

function GraphModal({ data, onClose }: GraphModalProps) {
  const { bestMatch, graphData } = data;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-6xl rounded-lg bg-white p-6 shadow-xl" // Made modal wider
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            Opportunity Graph
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-light text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content Area */}
        {/* Changed grid to 1/3 and 2/3 layout */}
        <div className="mt-4 grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto pr-2 md:grid-cols-3">
          {/* Left Side: Best Match (1/3 width) */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900">Best Match</h3>
            {bestMatch ? (
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-xl font-bold text-blue-600">
                  {bestMatch.address}
                </p>
                <p className="text-lg text-gray-800">
                  ${bestMatch.price.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  {bestMatch.beds} beds | {bestMatch.baths} baths
                </p>
                <p className="mt-3 text-sm italic text-gray-700">
                  "{bestMatch.rationale}"
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No suitable match found.</p>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              All Matches
            </h3>
            <ul className="list-disc pl-5 text-gray-700">
              {graphData.nodes
                .filter((n) => n.type === "property")
                .map((node) => (
                  <li
                    key={node.id}
                    className={node.isBestMatch ? "font-bold" : ""}
                  >
                    {node.label} ({node.score}/4 match)
                  </li>
                ))}
            </ul>
          </div>

          {/* Right Side: Graph Visualization (2/3 width) */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900">Market Map</h3>

            {/* --- THIS IS THE KEY CHANGE --- */}
            {/* Replaced the <pre> tag with the new component.
              We give it a fixed height so React Flow can render.
            */}
            <div className="h-[50vh] w-full rounded-lg border">
              <OpportunityGraph data={graphData} />
            </div>
            {/* --- END OF KEY CHANGE --- */}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
function CallsPage() {
  // (This component is unchanged)
  const [callLogs, setCallLogs] = useState<CallLogWithCustomer[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLogWithCustomer | null>(
    null,
  );
  const [filterOutcome, setFilterOutcome] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
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

  const handleGenerateMatch = async (log: CallLogWithCustomer) => {
    if (!log.notes) {
      alert("This call log has no notes to analyze.");
      return;
    }

    setIsGenerating(log.id);
    try {
      const criteria: GraphRequest = {
        callLogNotes: log.notes,
      };
      const data = await services.graph.generateGraph(criteria);
      setGraphData(data);
    } catch (err) {
      alert(`Error generating graph: ${err}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const filteredLogs = callLogs.filter((log) => {
    const outcomeMatch =
      filterOutcome === "all" || log.outcome === filterOutcome;
    const customerName = log.customer?.name?.toLowerCase() || "";
    const transcript = log.transcript.toLowerCase();
    const searchMatch =
      customerName.includes(searchQuery.toLowerCase()) ||
      transcript.includes(searchQuery.toLowerCase());
    return outcomeMatch && searchMatch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 text-gray-900">
      <Header title="Call Logs" />

      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Search by name or transcript..."
          className="p-2 border rounded-md w-full text-gray-900"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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

          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-lg text-gray-900">
                    {log.customer?.name ||
                      log.customer?.phone ||
                      "Unknown Caller"}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {new Date(log.startTime).toLocaleString()}
                  </span>
                </div>
                <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {log.outcome || "No Outcome"}
                </span>
              </div>

              <p className="text-gray-600 truncate mt-2">{log.transcript}</p>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCall(log)}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleGenerateMatch(log)}
                  disabled={isGenerating === log.id}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating === log.id ? "Generating..." : "Generate Match"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCall && (
        <CallLogModal
          log={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}

      {graphData && (
        <GraphModal data={graphData} onClose={() => setGraphData(null)} />
      )}
    </div>
  );
}

export default CallsPage;
