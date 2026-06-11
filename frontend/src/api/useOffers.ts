import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { offerKeys } from "#/queryKeys/offerKeys";
import type { MapOffersResponse, MapViewport } from "#/lib/types";
import { API_BASE_URL } from "#/lib/api-base-url";

const fetchOffers = async (
  viewport: MapViewport,
  sessionHash?: string,
): Promise<MapOffersResponse> => {
  const params = new URLSearchParams({
    north: viewport.north.toString(),
    south: viewport.south.toString(),
    east: viewport.east.toString(),
    west: viewport.west.toString(),
    zoom: viewport.zoom.toString(),
  });
  if (sessionHash) {
    params.append("sessionHash", sessionHash);
  }

  const response = await fetch(`${API_BASE_URL}/v1/map?${params}`);
  if (!response.ok) {
    throw new Error("Failed to load offers");
  }
  return response.json() as Promise<MapOffersResponse>;
};

export const useOffers = (
  viewport: MapViewport | null,
  sessionHash?: string,
  filtersExist: boolean = false,
): UseQueryResult<MapOffersResponse, Error> => {
  return useQuery({
    queryKey: offerKeys.map(viewport, sessionHash),
    queryFn: () => fetchOffers(viewport as MapViewport, sessionHash),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(viewport) && (!filtersExist || !!sessionHash),
  });
};
