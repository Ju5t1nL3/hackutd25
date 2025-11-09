// src/services/dashboard-api.ts

import { API_CONFIG, callingAgentClient } from './api-config'

// Placeholder type for Dashboard Stats
interface DashboardStats {
  totalCalls: number
  totalCustomers: number
  propertiesSearched: number
  lastAgentUpdate: string
}

const { endpoints } = API_CONFIG

/**
 * Service class for interacting with Dashboard Statistics via the Calling Agent.
 */
export class DashboardApiService {
  /**
   * Fetches the main dashboard statistics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Calls external Calling Agent: http://localhost:3001/api/stats/dashboard
    return callingAgentClient.get<DashboardStats>(endpoints.stats.dashboard)
  }
}

export const dashboardApiService = new DashboardApiService()