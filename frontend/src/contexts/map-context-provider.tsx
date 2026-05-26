import { useMemo, useState, type ReactNode } from "react";
import { MapContext } from "./map-context";
import type { MapOffersResponse } from "../lib/types";

type MapContextProviderProps = {
  children: ReactNode;
  mapOffers: MapOffersResponse[];
};

export default function MapContextProvider({
  children,
  mapOffers,
}: MapContextProviderProps) {
  const [selectedOffer, setSelectedOffer] = useState<MapOffersResponse | null>(
    null,
  );

  const value = useMemo(
    () => ({
      selectedOffer,
      isSelected: !!selectedOffer,
      selectOffer: setSelectedOffer,
      clearSelection: () => setSelectedOffer(null),
      mapOffers,
    }),
    [selectedOffer, mapOffers],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
