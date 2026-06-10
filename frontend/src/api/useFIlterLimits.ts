import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { FilterLimitsResponse } from "#/lib/types";
import { filterLimitsKeys } from "#/queryKeys/filterLimitsKeys";

type FilterLimitsParams = {
  city?: string;
};

const fetchFilterLimits = async (
  city: string,
): Promise<FilterLimitsResponse> => {
  const response = await fetch(
    `http://localhost:4000/v1/filter-limits/${city}`,
  );
  if (!response.ok) {
    throw new Error("Failed to load filter limits");
  }
  return response.json() as Promise<FilterLimitsResponse>;
};

export const useFilterLimits = (
  params: FilterLimitsParams = {},
): UseQueryResult<FilterLimitsResponse, Error> => {
  const { city = "Cracow" } = params;

  return useQuery({
    queryKey: filterLimitsKeys.limits(city),
    queryFn: () => fetchFilterLimits(city),
    staleTime: 10 * 60 * 1000,
  });
};
