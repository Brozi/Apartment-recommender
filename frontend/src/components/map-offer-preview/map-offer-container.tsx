import { useMapContext } from "#/hooks/use-map-context";
import MapOfferBlank from "#/components/map-offer-preview/map-offer-blank";
import styles from "#/components/map-offer-preview/map-offer-container.module.css";
import MapOfferPreview from "#/components/map-offer-preview/map-offer-preview";
import OfferBgAddon from "#/assets/offer-bg-addon.svg";

export default function MapOfferContainer() {
  const { selectedOfferId, clearSelection } = useMapContext();

  return (
    <div className={styles.mapOfferContainer}>
      {!selectedOfferId && <MapOfferBlank />}
      {selectedOfferId && (
        <>
          <MapOfferPreview
            selectedOfferId={selectedOfferId}
            onClose={clearSelection}
          />
          <img
            className={styles.offerBgAddon}
            src={OfferBgAddon}
            alt="offer background addon"
          />
        </>
      )}
    </div>
  );
}
