import { useMemo, useState, type ReactNode } from "react";
import type { MapOfferLocation } from "../lib/map-data";
import { MapContext } from "./map-context";

type MapContextProviderProps = {
  children: ReactNode;
};

export default function MapContextProvider({
  children,
}: MapContextProviderProps) {
  const [selectedOffer, setSelectedOffer] = useState<MapOfferLocation | null>(
    null,
  );

  const value = useMemo(
    () => ({
      selectedOffer,
      isSelected: !!selectedOffer,
      selectOffer: setSelectedOffer,
      clearSelection: () => setSelectedOffer(null),
    }),
    [selectedOffer],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
