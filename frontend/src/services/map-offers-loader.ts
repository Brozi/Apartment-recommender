import type { MapOffersResponse } from "../lib/types";

const fetchMapOffers = async (): Promise<MapOffersResponse[]> => {
  const response = await fetch("http://localhost:4000/v1/map");
  if (!response.ok) {
    throw new Error("Failed to load map offers");
  }

  return response.json() as Promise<MapOffersResponse[]>;
};

export const mapOffersLoader = async () => {
  return fetchMapOffers();
};
