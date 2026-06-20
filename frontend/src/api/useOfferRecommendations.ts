import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { MapOfferRecommendationResponse } from "#/lib/types";
import { offerKeys } from "#/queryKeys/offerKeys";

const fetchOfferRecommendations = async (
  sessionHash: string,
): Promise<MapOfferRecommendationResponse> => {
  const response = await fetch(`/v1/recommendation-info/${sessionHash}`);
  if (!response.ok) {
    throw new Error("Failed to load offer details");
  }
  return response.json() as Promise<MapOfferRecommendationResponse>;
};

export const useOfferRecommendations = (
  sessionHash: string,
): UseQueryResult<MapOfferRecommendationResponse, Error> => {
  return useQuery({
    queryKey: offerKeys.redis(sessionHash),
    queryFn: () => fetchOfferRecommendations(sessionHash),
    staleTime: 10 * 60 * 1000,
  });
};
