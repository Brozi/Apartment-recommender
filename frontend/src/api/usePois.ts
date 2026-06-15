import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { MapPoisResponse, MapViewport } from "#/lib/types";
import { poisKeys } from "#/queryKeys/poisKeys";

const fetchPois = async (viewport: MapViewport): Promise<MapPoisResponse> => {
  const params = new URLSearchParams({
    north: viewport.north.toString(),
    south: viewport.south.toString(),
    east: viewport.east.toString(),
    west: viewport.west.toString(),
    zoom: viewport.zoom.toString(),
  });
  const response = await fetch(`/v1/pois?${params}`);
  if (!response.ok) {
    throw new Error("Failed to load points of interest (POIs)");
  }
  return response.json() as Promise<MapPoisResponse>;
};

export const usePois = (
  viewport: MapViewport | null,
): UseQueryResult<MapPoisResponse, Error> => {
  return useQuery({
    queryKey: poisKeys.map(viewport),
    queryFn: () => fetchPois(viewport as MapViewport),
    staleTime: 10 * 60 * 1000,
    enabled: viewport !== null && viewport.zoom >= 17,
  });
};
