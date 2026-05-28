import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { offerKeys } from "#/queryKeys/offerKeys";
import type { MapOffersResponse } from "#/lib/types";

const fetchOffers = async (): Promise<MapOffersResponse[]> => {
  const response = await fetch(`http://localhost:4000/v1/map`);
  if (!response.ok) {
    throw new Error("Failed to load offers");
  }
  return response.json() as Promise<MapOffersResponse[]>;
};

export const useOffers = (): UseQueryResult<MapOffersResponse[], Error> => {
  return useQuery({
    queryKey: offerKeys.all,
    queryFn: () => fetchOffers(),
    staleTime: 10 * 60 * 1000,
  });
};
