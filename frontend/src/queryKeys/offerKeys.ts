export const offerKeys = {
  all: ["offers"] as const,
  details: () => [...offerKeys.all, "details"] as const,
  map: (
    viewport: {
      north: number;
      south: number;
      east: number;
      west: number;
      zoom: number;
    } | null,
    sessionHash?: string,
  ) => [...offerKeys.all, "map", viewport, sessionHash] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
  IDsByPoint: (lat: number, lng: number) =>
    [...offerKeys.all, "idsByPoint", lat, lng] as const,
};
