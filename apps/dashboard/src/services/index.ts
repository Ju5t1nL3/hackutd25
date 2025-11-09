// src/services/index.ts

export * from "./api-config";
export * from "./call-logs-api";
export * from "./customers-api";
export * from "./dashboard-api";
export * from "./properties-api";
export * from './graph-api'; // <-- Add this
export * from './schemas'; // <-- Add this

// Exporting the initialized service instances
import { getCallLogs } from "./call-logs-api";
import { generateGraph } from './graph-api'; // <-- Add this
import { customersApiService } from "./customers-api";
import { dashboardApiService } from "./dashboard-api";
import { propertiesApiService } from "./properties-api";

export const services = {
  callLogs: { getCallLogs },
  graph: {
    // <-- Add this new service
    generateGraph,
  },
  customers: customersApiService,
  dashboard: dashboardApiService,
  properties: propertiesApiService,
};
