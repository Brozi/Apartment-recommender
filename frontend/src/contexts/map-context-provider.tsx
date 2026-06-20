import L from "leaflet";
import { useMemo, useState, type ReactNode } from "react";
import { MapContext } from "#/contexts/map-context";
import type {
  MapOffersInPoint,
  MapOffersResponse,
  MapPoi,
  MapPoisResponse,
} from "#/lib/types";
import { useOfferPagination } from "#/store/useOfferPagination";

type MapContextProviderProps = {
  children: ReactNode;
  mapData: MapOffersResponse;
  poisData: MapPoisResponse;
  sessionHash?: string;
};

export default function MapContextProvider({
  children,
  mapData,
  poisData,
  sessionHash,
}: MapContextProviderProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOffersInPoint, setSelectedOffersInPoint] =
    useState<MapOffersInPoint | null>(null);
  const [selectedPoiCluster, setSelectedPoiCluster] = useState<MapPoi[] | null>(
    null,
  );
  const [selectedSinglePoi, setSelectedSinglePoi] = useState<MapPoi | null>(
    null,
  );
  const mapBasePosition = [50.06143, 19.93658] as [number, number];

  const resetOfferPagination = useOfferPagination((state) => state.reset);

  const selectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setSelectedOffersInPoint(null);
    setSelectedPoiCluster(null);
    setSelectedSinglePoi(null);
    resetOfferPagination();
  };

  const selectOffersInPoint = (selection: MapOffersInPoint) => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(selection);
    setSelectedPoiCluster(null);
    setSelectedSinglePoi(null);
    resetOfferPagination();
  };

  const selectPoiCluster = (pois: MapPoi[]) => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(null);
    setSelectedPoiCluster(pois);
    setSelectedSinglePoi(null);
    resetOfferPagination();
  };

  const selectSinglePoi = (poi: MapPoi) => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(null);
    setSelectedPoiCluster(null);
    setSelectedSinglePoi(poi);
    resetOfferPagination();
  };

  const clearSelection = () => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(null);
    setSelectedPoiCluster(null);
    setSelectedSinglePoi(null);
    resetOfferPagination();
  };

  const value = useMemo(
    () => ({
      selectedOfferId,
      selectedOffersInPoint,
      selectedPoiCluster,
      selectedSinglePoi,
      isSelected: Boolean(
        selectedOfferId ||
        selectedOffersInPoint ||
        selectedPoiCluster ||
        selectedSinglePoi,
      ),
      selectOffer,
      selectOffersInPoint,
      selectPoiCluster,
      selectSinglePoi,
      clearSelection,
      mapData,
      poisData,
      sessionHash,
      mapBasePosition,
    }),
    [
      selectedOfferId,
      selectedOffersInPoint,
      selectedPoiCluster,
      selectedSinglePoi,
      mapData,
      poisData,
      resetOfferPagination,
    ],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
