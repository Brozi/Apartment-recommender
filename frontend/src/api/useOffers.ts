import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { offerKeys } from "#/queryKeys/offerKeys";
import type { MapOffersResponse, MapViewport } from "#/lib/types";

const fetchOffers = async (
  viewport: MapViewport,
): Promise<MapOffersResponse> => {
  const params = new URLSearchParams({
    north: viewport.north.toString(),
    south: viewport.south.toString(),
    east: viewport.east.toString(),
    west: viewport.west.toString(),
    zoom: viewport.zoom.toString(),
  });
  console.log(`http://localhost:4000/v1/map?${params}`);

  const response = await fetch(`http://localhost:4000/v1/map?${params}`);
  if (!response.ok) {
    throw new Error("Failed to load offers");
  }
  return response.json() as Promise<MapOffersResponse>;
};

export const useOffers = (
  viewport: MapViewport | null,
): UseQueryResult<MapOffersResponse, Error> => {
  return useQuery({
    queryKey: offerKeys.map(viewport),
    queryFn: () => fetchOffers(viewport as MapViewport),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(viewport),
  });
};
