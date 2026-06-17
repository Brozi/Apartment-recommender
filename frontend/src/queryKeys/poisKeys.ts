export const poisKeys = {
  all: ["pois"] as const,
  detail: (id: number) => [...poisKeys.all, "details", id] as const,
  map: (
    viewport: {
      north: number;
      south: number;
      east: number;
      west: number;
      zoom: number;
    } | null,
  ) => [...poisKeys.all, "map", viewport] as const,
};
