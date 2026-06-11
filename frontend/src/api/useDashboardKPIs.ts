import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { DashboardKPIsResponse } from "#/lib/types";
import { dashboardKeys } from "#/queryKeys/dashboardKeys";
import { API_BASE_URL } from "#/lib/api-base-url";

type DashboardKPIsParams = {
  city?: string;
  month?: string;
};

const fetchDashboardKPIs = async (): Promise<DashboardKPIsResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/dashboard/kpis`);
  if (!response.ok) {
    throw new Error("Failed to load dashboard KPIs");
  }
  return response.json() as Promise<DashboardKPIsResponse>;
};

export const useDashboardKPIs = (
  params: DashboardKPIsParams = {},
): UseQueryResult<DashboardKPIsResponse, Error> => {
  const { city = "Cracow", month = "May" } = params;

  return useQuery({
    queryKey: dashboardKeys.kpis(city, month),
    queryFn: () => fetchDashboardKPIs(),
    staleTime: 10 * 60 * 1000,
  });
};
