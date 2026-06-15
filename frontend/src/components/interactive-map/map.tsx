import MapBox from "#/components/interactive-map/map-box";
import styles from "#/components/interactive-map/interactive-map.module.css";
import LeafletMap from "#/components/interactive-map/leaflet-map";
import type { MapViewport } from "#/lib/types";
import PoiClusterPreview from "../pois/poi-cluster-preview";
import PoiPreview from "../pois/poi-preview";

type MapProps = {
  onViewportChange: (viewport: MapViewport) => void;
};

export default function Map({ onViewportChange }: MapProps) {
  return (
    <MapBox>
      <div className={styles.MapContainer}>
        <LeafletMap onViewportChange={onViewportChange} />
      </div>
      <PoiClusterPreview />
      <PoiPreview />
    </MapBox>
  );
}
