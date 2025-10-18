import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import type { DashboardSummary, DashboardUserSummary, DashboardRevenueSummary } from "@shared/schema";

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      // Handle the response structure
      if (response.data.data) {
        return response.data.data;
      }
      return response.data;
    },
  });
};

export const useDashboardUserSummary = (year: number) => {
  return useQuery<DashboardUserSummary>({
    queryKey: ["dashboard-user-summary", year],
    queryFn: async () => {
      const response = await dashboardApi.getUserSummary(year);
      // Handle the response structure
      if (response.data.data) {
        return response.data.data;
      }
      return response.data;
    },
  });
};

export const useDashboardRevenueSummary = (year: number) => {
  return useQuery<DashboardRevenueSummary>({
    queryKey: ["dashboard-revenue-summary", year],
    queryFn: async () => {
      const response = await dashboardApi.getRevenueSummary(year);
      // Handle the response structure
      if (response.data.data) {
        return response.data.data;
      }
      return response.data;
    },
  });
};
