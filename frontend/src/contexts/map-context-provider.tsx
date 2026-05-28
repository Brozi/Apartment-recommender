import { useMemo, useState, type ReactNode } from "react";
import { MapContext } from "#/contexts/map-context";
import type { MapOffersResponse } from "#/lib/types";

type MapContextProviderProps = {
  children: ReactNode;
  mapOffers: MapOffersResponse[];
};

export default function MapContextProvider({
  children,
  mapOffers,
}: MapContextProviderProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      selectedOfferId,
      isSelected: !!selectedOfferId,
      selectOffer: setSelectedOfferId,
      clearSelection: () => setSelectedOfferId(null),
      mapOffers,
    }),
    [selectedOfferId, mapOffers],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
