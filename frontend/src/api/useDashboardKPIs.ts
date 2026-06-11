import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { DashboardKPIsResponse } from "#/lib/types";
import { dashboardKeys } from "#/queryKeys/dashboardKeys";

type DashboardKPIsParams = {
  city?: string;
  month?: string;
};

const fetchDashboardKPIs = async (): Promise<DashboardKPIsResponse> => {
  const response = await fetch("/v1/dashboard/kpis");
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
