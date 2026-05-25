import { useMapContext } from "../../hooks/use-map-context";
import MapOfferBlank from "./map-offer-blank";
import styles from "./map-offer-container.module.css";
import MapOfferPreview from "./map-offer-preview";

export default function MapOfferContainer() {
  const { isSelected, selectedOffer, clearSelection } = useMapContext();
  return (
    <div className={styles.mapOfferContainer}>
      {isSelected && selectedOffer ? (
        <MapOfferPreview
          area={selectedOffer.area}
          location={selectedOffer.location}
          price={selectedOffer.price}
          pricePerM2={selectedOffer.pricePerM2}
          rooms={selectedOffer.rooms}
          onClose={clearSelection}
        />
      ) : (
        <MapOfferBlank />
      )}
    </div>
  );
}
