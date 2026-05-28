import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { OfferDetailsResponse } from "#/lib/types";
import { offerKeys } from "#/queryKeys/offerKeys";

const fetchOfferDetails = async (id: string): Promise<OfferDetailsResponse> => {
  const response = await fetch(`http://localhost:4000/v1/offer/${id}`);
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
