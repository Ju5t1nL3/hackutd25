// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import CustomerInfoPanel from "@/components/CustomerInfoPanel";
import CallSelector from "@/components/CallSelector";

// Types for our data
export interface CallSummary {
  id: string;
  customerId: string;
  customerName: string;
  status: "active" | "completed" | "missed";
  startTime: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: "agent" | "customer";
  text: string;
  timestamp: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  intent: "buy" | "rent" | "unknown";
  location: string;
  zipCode?: string;
  timeline?: string;
  budget?: string;
  bedrooms?: string;
  notes?: string;
}

const HomePage: React.FC = () => {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch list of calls on mount
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await callLogsApiService.getActiveCalls()

        // Mock data for now
        const mockCalls: CallSummary[] = [
          {
            id: "call-1",
            customerId: "cust-1",
            customerName: "John Smith",
            status: "active",
            startTime: new Date().toISOString(),
          },
          {
            id: "call-2",
            customerId: "cust-2",
            customerName: "Sarah Johnson",
            status: "completed",
            startTime: new Date(Date.now() - 3600000).toISOString(),
          },
        ];

        setCalls(mockCalls);
        if (mockCalls.length > 0) {
          setSelectedCallId(mockCalls[0].id);
        }
      } catch (error) {
        console.error("Error fetching calls:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Fetch call details when selected call changes
  useEffect(() => {
    if (!selectedCallId) return;

    const fetchCallDetails = async () => {
      try {
        // TODO: Replace with actual API calls
        // const [transcriptData, customerData] = await Promise.all([
        //   callLogsApiService.getCallTranscript(selectedCallId),
        //   customersApiService.getCustomerByCallId(selectedCallId)
        // ])

        // Mock data for now
        const mockTranscript: TranscriptMessage[] = [
          {
            id: "msg-1",
            speaker: "agent",
            text: "Hello! This is Broker AI. How can I help you today?",
            timestamp: new Date(Date.now() - 120000).toISOString(),
          },
          {
            id: "msg-2",
            speaker: "customer",
            text: "Hi, I'm looking to rent a 2-bedroom apartment in downtown Seattle.",
            timestamp: new Date(Date.now() - 100000).toISOString(),
          },
          {
            id: "msg-3",
            speaker: "agent",
            text: "Great! I can help you with that. What's your preferred timeline for moving in?",
            timestamp: new Date(Date.now() - 80000).toISOString(),
          },
          {
            id: "msg-4",
            speaker: "customer",
            text: "I'm looking to move in by the end of next month. My budget is around $2,500 per month.",
            timestamp: new Date(Date.now() - 60000).toISOString(),
          },
        ];

        const mockCustomerInfo: CustomerInfo = {
          id: "cust-1",
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          intent: "rent",
          location: "Seattle, WA",
          zipCode: "98101",
          timeline: "End of next month",
          budget: "$2,500/month",
          bedrooms: "2",
          notes: "Prefers downtown area, near public transit",
        };

        setTranscript(mockTranscript);
        setCustomerInfo(mockCustomerInfo);
      } catch (error) {
        console.error("Error fetching call details:", error);
      }
    };

    fetchCallDetails();
  }, [selectedCallId]);

  // Setup WebSocket connection for real-time transcript updates
  useEffect(() => {
    if (!selectedCallId) return;

    // TODO: Replace with actual WebSocket connection
    // const ws = new WebSocket(`ws://your-backend-url/calls/${selectedCallId}/transcript`)

    // ws.onmessage = (event) => {
    //   const newMessage: TranscriptMessage = JSON.parse(event.data)
    //   setTranscript(prev => [...prev, newMessage])
    // }

    // ws.onerror = (error) => {
    //   console.error('WebSocket error:', error)
    // }

    // Mock real-time updates for demo
    const interval = setInterval(() => {
      // Simulate new messages occasionally
      if (Math.random() > 0.7) {
        const newMessage: TranscriptMessage = {
          id: `msg-${Date.now()}`,
          speaker: Math.random() > 0.5 ? "agent" : "customer",
          text: "This is a simulated real-time message...",
          timestamp: new Date().toISOString(),
        };
        setTranscript((prev) => [...prev, newMessage]);
      }
    }, 5000);

    return () => {
      // ws.close()
      clearInterval(interval);
    };
  }, [selectedCallId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Live Call Dashboard
        </h1>
        <CallSelector
          calls={calls}
          selectedCallId={selectedCallId}
          onSelectCall={setSelectedCallId}
        />
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Live Transcript */}
        <div className="w-1/2 border-r border-gray-200 bg-white">
          <TranscriptPanel
            transcript={transcript}
            callStatus={
              calls.find((c) => c.id === selectedCallId)?.status || "completed"
            }
          />
        </div>

        {/* Right: Customer Information */}
        <div className="w-1/2 bg-white">
          <CustomerInfoPanel customerInfo={customerInfo} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
