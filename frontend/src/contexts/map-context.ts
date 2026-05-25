import { createContext } from "react";
import type { MapOfferLocation } from "../lib/map-data";

type MapContextType = {
  selectedOffer: MapOfferLocation | null;
  isSelected: boolean;
  selectOffer: (offer: MapOfferLocation) => void;
  clearSelection: () => void;
};

export const MapContext = createContext<MapContextType | null>(null);
