import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
  MapClusterItem,
  MapOfferItem,
  MapOffersInPoint,
  MapOffersResponse,
  MapViewport,
} from "#/lib/types";
import { offerKeys } from "#/queryKeys/offerKeys";

type TileBounds = {
  south: number;
  north: number;
  west: number;
  east: number;
};

function getTileSize(zoom: number): { lat: number; lng: number } {
  if (zoom >= 16) return { lat: 0.02, lng: 0.04 };
  if (zoom >= 14) return { lat: 0.08, lng: 0.15 };
  if (zoom >= 12) return { lat: 0.3, lng: 0.6 };
  if (zoom >= 10) return { lat: 1.5, lng: 3.0 };
  return { lat: 6.0, lng: 12.0 };
}

function r7(v: number): number {
  return Math.round(v * 1e7) / 1e7;
}

function snapDown(value: number, step: number): number {
  return r7(Math.floor(r7(value / step)) * step);
}

function getVisibleTiles(viewport: MapViewport): TileBounds[] {
  const { lat: latStep, lng: lngStep } = getTileSize(viewport.zoom);
  const tiles: TileBounds[] = [];

  const southStart = snapDown(viewport.south, latStep);
  const westStart = snapDown(viewport.west, lngStep);

  for (
    let lat = southStart;
    r7(lat) < r7(viewport.north);
    lat = r7(lat + latStep)
  ) {
    for (
      let lng = westStart;
      r7(lng) < r7(viewport.east);
      lng = r7(lng + lngStep)
    ) {
      tiles.push({
        south: r7(lat),
        north: r7(lat + latStep),
        west: r7(lng),
        east: r7(lng + lngStep),
      });
    }
  }

  return tiles;
}

async function fetchTile(
  tile: TileBounds,
  zoom: number,
  sessionHash?: string,
): Promise<MapOffersResponse> {
  const params = new URLSearchParams({
    north: tile.north.toString(),
    south: tile.south.toString(),
    east: tile.east.toString(),
    west: tile.west.toString(),
    zoom: zoom.toString(),
  });
  if (sessionHash) {
    params.append("sessionHash", sessionHash);
  }
  const response = await fetch(`/v1/map?${params}`);
  if (!response.ok) {
    throw new Error("Failed to load map tile");
  }
  return response.json() as Promise<MapOffersResponse>;
}

function mergeTileResults(results: MapOffersResponse[]): MapOffersResponse {
  const offerMap = new Map<string, MapOfferItem>();
  const oipMap = new Map<string, MapOffersInPoint>();
  const clusterList: MapClusterItem[] = [];
  let resultsCount: number | undefined;

  for (const res of results) {
    if (res.resultsCount) resultsCount = res.resultsCount;
    for (const o of res.offers.items) offerMap.set(o.id, o);
    for (const oip of res.offersInPoint.items)
      oipMap.set(oip.firstOfferID, oip);
    clusterList.push(...res.clusters.items);
  }

  return {
    offers: { items: Array.from(offerMap.values()) },
    offersInPoint: { items: Array.from(oipMap.values()) },
    clusters: { items: clusterList },
    resultsCount,
  };
}

type TiledOffersResult = {
  data: MapOffersResponse | undefined;
  error: Error | null;
};

export function useTiledOffers(
  viewport: MapViewport | null,
  sessionHash?: string,
  filtersExist = false,
): TiledOffersResult {
  const tiles = useMemo(
    () => (viewport ? getVisibleTiles(viewport) : []),
    [viewport],
  );

  const enabled = Boolean(viewport) && (!filtersExist || !!sessionHash);

  const results = useQueries({
    queries: tiles.map((tile) => ({
      queryKey: offerKeys.tile(tile, viewport!.zoom, sessionHash),
      queryFn: () => fetchTile(tile, viewport!.zoom, sessionHash),
      staleTime: 10 * 60 * 1000,
      enabled,
    })),
  });

  const data = useMemo(() => {
    if (!enabled) return undefined;
    const loaded = results
      .filter((r) => r.data !== undefined)
      .map((r) => r.data!);
    if (loaded.length === 0) return undefined;
    return mergeTileResults(loaded);
  }, [results, enabled]);

  const allFailed =
    results.length > 0 && results.every((r) => r.error !== null);
  const error: Error | null =
    allFailed && !data ? ((results[0].error as Error | null) ?? null) : null;

  return { data, error };
}
