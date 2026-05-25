import { useContext } from "react";
import { MapContext } from "../contexts/map-context";

export function useMapContext() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMapContext must be used within MapContextProvider");
  }

  return context;
}
