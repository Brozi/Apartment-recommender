import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { OfferDetailsResponse } from "#/lib/types";
import { offerKeys } from "#/queryKeys/offerKeys";
import { API_BASE_URL } from "#/lib/api-base-url";

const fetchOfferDetails = async (id: string): Promise<OfferDetailsResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/offer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load offer details");
  }
  return response.json() as Promise<OfferDetailsResponse>;
};

export const useOfferDetails = (
  id: string,
): UseQueryResult<OfferDetailsResponse, Error> => {
  return useQuery({
    queryKey: offerKeys.detail(id),
    queryFn: () => fetchOfferDetails(id),
    staleTime: 10 * 60 * 1000,
  });
};
