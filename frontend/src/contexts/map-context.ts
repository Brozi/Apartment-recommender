import { createContext } from "react";
import type {
  MapOffersInPoint,
  MapOffersResponse,
  MapPoi,
  MapPoisResponse,
} from "#/lib/types";

type MapContextType = {
  selectedOfferId: string | null;
  selectedOffersInPoint: MapOffersInPoint | null;
  selectedPoiCluster: MapPoi[] | null;
  selectedSinglePoi: MapPoi | null;
  isSelected: boolean;
  selectOffer: (offerId: string) => void;
  selectOffersInPoint: (selection: MapOffersInPoint) => void;
  selectPoiCluster: (pois: MapPoi[]) => void;
  selectSinglePoi: (poi: MapPoi) => void;
  clearSelection: () => void;
  mapData: MapOffersResponse;
  poisData: MapPoisResponse;
  sessionHash?: string;
};

export const MapContext = createContext<MapContextType | null>(null);
