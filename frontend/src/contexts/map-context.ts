import { createContext } from "react";
import type { MapOffersResponse } from "../lib/types";

type MapContextType = {
  selectedOffer: MapOffersResponse | null;
  isSelected: boolean;
  selectOffer: (offer: MapOffersResponse) => void;
  clearSelection: () => void;
  mapOffers: MapOffersResponse[];
};

export const MapContext = createContext<MapContextType | null>(null);
