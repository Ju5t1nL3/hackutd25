// src/services/call-logs-api.ts

import { API_CONFIG, callingAgentClient } from './api-config'

// Placeholder type for a Call Log
interface CallLog {
  id: number
  customerId: number
  transcript: string
  durationSeconds: number
  callStartTime: string
  outcome: 'scheduled' | 'interested' | 'not_interested' | 'follow_up' | 'no_answer'
  notes: string
}

const { endpoints } = API_CONFIG

/**
 * Service class for interacting with the Call Logs API via the Calling Agent.
 */
export class CallLogsApiService {
  /**
   * Fetches a list of all call logs.
   */
  async getCallLogs(): Promise<CallLog[]> {
    // Calls external Calling Agent: http://localhost:3001/api/calls
    return callingAgentClient.get<CallLog[]>(endpoints.calls.list)
  }

  /**
   * Fetches a specific call log by ID.
   */
  async getCallLogDetail(id: number): Promise<CallLog> {
    // Calls external Calling Agent: http://localhost:3001/api/calls/{id}
    const endpoint = endpoints.calls.detail(id)
    return callingAgentClient.get<CallLog>(endpoint)
  }
}

export const callLogsApiService = new CallLogsApiService()