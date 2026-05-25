import MapBox from "./map-box";
import styles from "./interactive-map.module.css";
import LeafletMap from "./leaflet-map.tsx";

export default function Map() {
  return (
    <MapBox>
      <div className={styles.MapContainer}>
        <LeafletMap />
      </div>
    </MapBox>
  );
}
