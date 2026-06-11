import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { CleanedFilterFormValues } from "#/lib/filter-url-utils";

type SearchSessionResponse = {
  sessionHash: string;
};

const postFiltersSession = async (
  filters: CleanedFilterFormValues,
): Promise<SearchSessionResponse> => {
  const response = await fetch("/v1/filters-and-recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!response.ok) {
    throw new Error("Failed to create filter session");
  }
  return response.json() as Promise<SearchSessionResponse>;
};

export const useSearchSession = (
  decodedFilters: CleanedFilterFormValues | null,
): UseQueryResult<SearchSessionResponse, Error> => {
  return useQuery({
    queryKey: ["searchSession", decodedFilters],
    queryFn: () => postFiltersSession(decodedFilters!),
    enabled: !!decodedFilters,
    staleTime: 55 * 60 * 1000,
  });
};
