import { useMemo, useState, type ReactNode } from "react";
import { MapContext } from "#/contexts/map-context";
import type { MapOffersInPoint, MapOffersResponse } from "#/lib/types";
import { useOfferPagination } from "#/store/useOfferPagination";

type MapContextProviderProps = {
  children: ReactNode;
  mapData: MapOffersResponse;
};

export default function MapContextProvider({
  children,
  mapData,
}: MapContextProviderProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOffersInPoint, setSelectedOffersInPoint] =
    useState<MapOffersInPoint | null>(null);
  const resetOfferPagination = useOfferPagination((state) => state.reset);

  const selectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setSelectedOffersInPoint(null);
    resetOfferPagination();
  };

  const selectOffersInPoint = (selection: MapOffersInPoint) => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(selection);
    resetOfferPagination();
  };

  const clearSelection = () => {
    setSelectedOfferId(null);
    setSelectedOffersInPoint(null);
    resetOfferPagination();
  };

  const value = useMemo(
    () => ({
      selectedOfferId,
      selectedOffersInPoint,
      isSelected: Boolean(selectedOfferId || selectedOffersInPoint),
      selectOffer,
      selectOffersInPoint,
      clearSelection,
      mapData,
    }),
    [selectedOfferId, selectedOffersInPoint, mapData, resetOfferPagination],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
