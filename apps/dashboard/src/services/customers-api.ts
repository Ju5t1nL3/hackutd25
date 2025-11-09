// src/services/customers-api.ts

import { API_CONFIG, callingAgentClient } from './api-config'

// Placeholder type for a Customer
interface Customer {
  id: number
  name: string
  email: string
  houseWanted: string | null
  lastCallTime: string
}

const { endpoints } = API_CONFIG

/**
 * Service class for interacting with the Customers API via the Calling Agent.
 */
export class CustomersApiService {
  /**
   * Fetches a list of all customers.
   */
  async getCustomers(): Promise<Customer[]> {
    // Calls external Calling Agent: http://localhost:3001/api/customers
    return callingAgentClient.get<Customer[]>(endpoints.customers.list)
  }

  /**
   * Fetches a specific customer by ID.
   */
  async getCustomerDetail(id: number): Promise<Customer> {
    // Calls external Calling Agent: http://localhost:3001/api/customers/{id}
    const endpoint = endpoints.customers.detail(id)
    return callingAgentClient.get<Customer>(endpoint)
  }
}

export const customersApiService = new CustomersApiService()