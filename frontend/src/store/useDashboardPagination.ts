import { useRouterState } from "@tanstack/react-router";
import { create } from "zustand";
import type { PaginationModel } from "#/store/paginationModels";

export const DASHBOARD_PAGINATION_DATA = [
  { path: "kpis", label: "KPI's" },
  { path: "geography-and-distribution", label: "Geography & Distribution" },
  { path: "smart-buyer-insights", label: "Smart Buyer Insights" },
];

type DashboardPaginationState = {
  steps: typeof DASHBOARD_PAGINATION_DATA;
};

export const useDashboardPagination = create<DashboardPaginationState>(() => ({
  steps: DASHBOARD_PAGINATION_DATA,
}));

export function useDashboardPaginationModel(): PaginationModel | null {
  const steps = useDashboardPagination((state) => state.steps);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const dashboardBasePath = "/dashboard";
  const currentPath = pathname.split("/").pop() || "";
  const currentIndex = steps.findIndex((step) => step.path === currentPath);

  if (currentIndex === -1) return null;

  const totalSteps = steps.length;
  const prevIndex = (currentIndex - 1 + totalSteps) % totalSteps;
  const nextIndex = (currentIndex + 1) % totalSteps;

  return {
    type: "nav",
    currentIndex,
    totalSteps,
    label: steps[currentIndex].label,
    prevPath: `${dashboardBasePath}/${steps[prevIndex].path}`,
    nextPath: `${dashboardBasePath}/${steps[nextIndex].path}`,
  };
}
