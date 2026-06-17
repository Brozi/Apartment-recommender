import { useMapContext } from "#/hooks/use-map-context";
import CloseIcon from "#/components/icons/close-icon";
import styles from "./poi-cluster-preview.module.css";
import { Button } from "../ui/button";
import PoiListItem from "./poi-list-item";

export default function PoiClusterPreview() {
  const { selectedPoiCluster, clearSelection } = useMapContext();

  if (!selectedPoiCluster) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className="font-h3">Pois in location</h3>
          <Button
            variant="outline"
            size="iconDefault"
            onClick={clearSelection}
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
        </div>
        <div className={styles.divider} />
        <ul className={styles.list}>
          {selectedPoiCluster.map((poi) => (
            <PoiListItem key={poi.id} poi={poi} />
          ))}
        </ul>
      </div>
    </div>
  );
}
