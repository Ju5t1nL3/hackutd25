// src/services/call-logs-api.ts

export interface CallLogWithCustomer {
  id: string;
  transcript: string;
  duration: number;
  startTime: string; // Prisma sends dates as ISO strings
  endTime: string | null;
  outcome: string | null;
  notes: string | null;
  customerId: string | null;
  // The customer object is now nested!
  customer: {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Fetches all call logs from our local Next.js API (the BFF).
 */
export async function getCallLogs(): Promise<CallLogWithCustomer[]> {
  try {
    // We fetch from the relative path, which is our BFF route
    const response = await fetch("/api/calls");

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getCallLogs service:", error);
    // Re-throw the error so the component can catch it
    throw error;
  }
}

