import type { DashboardKpisResponse } from "../lib/types";

const fetchDashboardKpis = async (): Promise<DashboardKpisResponse> => {
  const response = await fetch("http://localhost:4000/v1/dashboard/kpis");
  if (!response.ok) {
    throw new Error("Failed to load KPI data");
  }

  return response.json() as Promise<DashboardKpisResponse>;
};

export const kpisLoader = async () => {
  return fetchDashboardKpis();
};
