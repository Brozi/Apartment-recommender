import styles from "#/components/map-offer-preview/map-offer-blank.module.css";
import CornerLeft from "#/assets/left-corner-32.svg";
import CornerRight from "#/assets/right-corner-32.svg";
import TopAddon from "#/assets/blank-offer-preview-top.svg";
import BottomAddon from "#/assets/blank-offer-preview-bottom.svg";

export default function MapOfferBlank() {
  return (
    <div className={styles.mapOfferBlank}>
      <p className="font-paragraph">Click an offer to view details</p>

      <img src={CornerLeft} alt="Corner left" className={styles.cornerLeft} />
      <img
        src={CornerRight}
        alt="Corner right"
        className={styles.cornerRight}
      />
      <img src={TopAddon} alt="Top addon" className={styles.topAddon} />
      <img
        src={BottomAddon}
        alt="Bottom addon"
        className={styles.bottomAddon}
      />
    </div>
  );
}
