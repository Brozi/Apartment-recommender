import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { offerKeys } from "#/queryKeys/offerKeys";

type OfferIDsByPointResponse = {
  offerIDs: string[];
};

const fetchOfferIDsByPoint = async (
  lat: number,
  lng: number,
): Promise<OfferIDsByPointResponse> => {
  const response = await fetch(`/v1/offers/by-point?lat=${lat}&lng=${lng}`);
  if (!response.ok) {
    throw new Error("Failed to load offer IDs");
  }
  return response.json() as Promise<OfferIDsByPointResponse>;
};

export const useOfferIDsByPoint = (
  lat: number | null,
  lng: number | null,
  enabled = true,
): UseQueryResult<OfferIDsByPointResponse, Error> => {
  return useQuery({
    queryKey: offerKeys.IDsByPoint(lat ?? 0, lng ?? 0),
    queryFn: () => fetchOfferIDsByPoint(lat as number, lng as number),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(enabled && lat !== null && lng !== null),
  });
};
