import { createContext } from "react";
import type { MapOffersInPoint, MapOffersResponse } from "#/lib/types";

type MapContextType = {
  selectedOfferId: string | null;
  selectedOffersInPoint: MapOffersInPoint | null;
  isSelected: boolean;
  selectOffer: (offerId: string) => void;
  selectOffersInPoint: (selection: MapOffersInPoint) => void;
  clearSelection: () => void;
  mapData: MapOffersResponse;
};

export const MapContext = createContext<MapContextType | null>(null);
