// src/services/properties-api.ts

import { API_CONFIG, searchingAgentClient } from './api-config'

// Placeholder type for a Property
interface Property {
  id: number
  address: string
  price: number
  agentNotes: string
}

// Placeholder type for a Search Query
interface PropertySearchQuery {
  minPrice?: number
  maxPrice?: number
  city?: string
  keywords?: string
}

const { endpoints } = API_CONFIG

/**
 * Service class for interacting with the Property Search API via the Searching Agent.
 */
export class PropertiesApiService {
  /**
   * Performs a property search using a query object.
   */
  async searchProperties(query: PropertySearchQuery): Promise<Property[]> {
    // Calls external Searching Agent: http://localhost:8000/api/properties/search
    return searchingAgentClient.get<Property[]>(endpoints.properties.search, query as Record<string, string>)
  }

  /**
   * Fetches a specific property detail by ID.
   */
  async getPropertyDetail(id: number): Promise<Property> {
    // Calls external Searching Agent: http://localhost:8000/api/properties/{id}
    const endpoint = endpoints.properties.detail(id)
    return searchingAgentClient.get<Property>(endpoint)
  }
}

export const propertiesApiService = new PropertiesApiService()