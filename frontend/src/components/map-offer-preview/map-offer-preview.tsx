import { cn } from "../../lib/utils";
import ImageIcon from "../icons/image-icon";
import LocationIcon from "../icons/location-icon";
import MeasureIcon from "../icons/measure-icon";
import PaginationArrowLeftIcon from "../icons/pagination-arrow-left-icon";
import PaginationArrowRightIcon from "../icons/pagination-arrow-right-icon";
import styles from "./map-offer-preview.module.css";
import OfferImage from "../../assets/offer-img.webp";
import Button from "../ui/button";
import LeftCorner from "../../assets/left-corner-32.svg";

type MapOfferPreviewProps = {
  price: number;
  location: string;
  rooms: number;
  area: number;
  pricePerM2: number;
  onClose?: () => void;
};

export default function MapOfferPreview({
  price,
  location,
  rooms,
  area,
  pricePerM2,
  onClose,
}: MapOfferPreviewProps) {
  return (
    <section className={styles.MapOfferContent}>
      <div className={styles.MapOfferImage}>
        <img src={OfferImage} alt="Offer image" className={styles.offerImg} />
        <button className={cn(styles.paginationBtn, styles.paginationBtnLeft)}>
          <PaginationArrowLeftIcon />
        </button>
        <button className={cn(styles.paginationBtn, styles.paginationBtnRight)}>
          <PaginationArrowRightIcon />
        </button>
        <div className={styles.imageIndicator}>
          <ImageIcon />
          <p className="font-indicator">1 / 18</p>
        </div>
      </div>

      <div className={styles.MapOfferDetails}>
        <section className={cn(styles.multiList, styles.gapM)}>
          <h3 className="font-highlight">{price.toLocaleString()} zł</h3>
          <div className={cn(styles.divider, styles.sizeM)} />
          <span className="font-addon-main">
            {pricePerM2.toLocaleString()} zł/m²
          </span>
        </section>

        <div className={styles.offerInfo}>
          <div className={styles.offerInfoItem}>
            <LocationIcon />
            <p className="font-base">{location}</p>
          </div>
          <div className={styles.offerInfoItem}>
            <MeasureIcon />
            <section className={cn(styles.multiList, styles.gapS)}>
              <p className="font-base">{area} m²</p>
              <div className={cn(styles.divider, styles.sizeS)} />
              <p className="font-base">{rooms} rooms</p>
            </section>
          </div>
        </div>
      </div>

      <div className={cn(styles.divider, styles.sizeL)} />

      <section className={styles.offerActions}>
        <Button
          style={{ justifyContent: "center" }}
          variant="secondary"
          label="Close"
          onClick={onClose}
        />
        <Button
          style={{ justifyContent: "center" }}
          variant="primary"
          label="See offer"
          onClick={() => {}}
        />
      </section>

      <img
        className={styles.leftCorner}
        src={LeftCorner}
        alt="left corner decoration"
      />
    </section>
  );
}
