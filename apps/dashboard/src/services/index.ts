// src/services/index.ts

export * from "./api-config";
export * from "./call-logs-api";
export * from "./customers-api";
export * from "./dashboard-api";
export * from "./properties-api";

// Exporting the initialized service instances
import { getCallLogs } from "./call-logs-api";
import { customersApiService } from "./customers-api";
import { dashboardApiService } from "./dashboard-api";
import { propertiesApiService } from "./properties-api";

export const services = {
  callLogs: { getCallLogs },
  customers: customersApiService,
  dashboard: dashboardApiService,
  properties: propertiesApiService,
};
