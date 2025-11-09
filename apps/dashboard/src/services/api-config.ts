// API Configuration
// Update these URLs based on your deployment environment

export const API_CONFIG = {
    // Backend service URLs
    CALLING_AGENT_URL: import.meta.env.VITE_CALLING_AGENT_URL || 'http://localhost:3001',
    SEARCHING_AGENT_URL: import.meta.env.VITE_SEARCHING_AGENT_URL || 'http://localhost:8000',
    
    // API endpoints
    endpoints: {
      // Call logs endpoints
      calls: {
        list: '/api/calls',
        detail: (id: number) => `/api/calls/${id}`,
        create: '/api/calls',
      },
      // Customer endpoints
      customers: {
        list: '/api/customers',
        detail: (id: number) => `/api/customers/${id}`,
        create: '/api/customers',
      },
      // Property search endpoints
      properties: {
        search: '/api/properties/search',
        list: '/api/properties',
        detail: (id: number) => `/api/properties/${id}`,
      },
      // Analytics/Stats endpoints
      stats: {
        dashboard: '/api/stats/dashboard',
        calls: '/api/stats/calls',
      },
    },
  }
  
  // API Response types
  export interface ApiResponse<T> {
    data: T
    message?: string
    error?: string
  }
  
  export interface ApiError {
    error: string
    message: string
    statusCode: number
  }
  
  // Base fetch wrapper with error handling
  export class ApiClient {
    private baseUrl: string
  
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl
    }
  
    private async handleResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
        const error: ApiError = {
          error: 'API Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        }
        
        try {
          const errorData = await response.json()
          error.message = errorData.message || error.message
          error.error = errorData.error || error.error
        } catch {
          // If error response is not JSON, use default error
        }
        
        throw error
      }
  
      try {
        return await response.json()
      } catch {
        // If response is not JSON, return empty object
        return {} as T
      }
    }
  
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
      }
  
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
  
      return this.handleResponse<T>(response)
    }
  
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })
  
      return this.handleResponse<T>(response)
    }
  
    async put<T>(endpoint: string, data?: unknown): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })
  
      return this.handleResponse<T>(response)
    }
  
    async delete<T>(endpoint: string): Promise<T> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
  
      return this.handleResponse<T>(response)
    }
  }
  
  // Initialize API clients for each backend service
  export const callingAgentClient = new ApiClient(API_CONFIG.CALLING_AGENT_URL)
  export const searchingAgentClient = new ApiClient(API_CONFIG.SEARCHING_AGENT_URL)