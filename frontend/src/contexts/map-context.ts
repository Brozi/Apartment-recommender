import { createContext } from "react";
import type { MapOffersResponse } from "#/lib/types";

type MapContextType = {
  selectedOfferId: string | null;
  isSelected: boolean;
  selectOffer: (offerId: string) => void;
  clearSelection: () => void;
  mapOffers: MapOffersResponse[];
};

export const MapContext = createContext<MapContextType | null>(null);
