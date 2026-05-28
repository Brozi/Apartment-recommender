import MapBox from "#/components/interactive-map/map-box";
import styles from "#/components/interactive-map/interactive-map.module.css";
import LeafletMap from "#/components/interactive-map/leaflet-map";

export default function Map() {
  return (
    <MapBox>
      <div className={styles.MapContainer}>
        <LeafletMap />
      </div>
    </MapBox>
  );
}
