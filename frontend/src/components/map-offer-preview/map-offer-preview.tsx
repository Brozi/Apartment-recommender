import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";
import ImageIcon from "../icons/image-icon";
import LocationIcon from "../icons/location-icon";
import PaginationArrowLeftIcon from "../icons/pagination-arrow-left-icon";
import PaginationArrowRightIcon from "../icons/pagination-arrow-right-icon";
import PrimaryButton from "../ui/primary-button";
import styles from "./map-offer-preview.module.css";
import OfferImage from "../../assets/offer-img.webp";

type MapOfferPreviewProps = {
  price: number;
  location: string;
  rooms: number;
  area: number;
  pricePerM2: number;
  className?: string;
  style?: CSSProperties;
  onClose?: () => void;
};

export default function MapOfferPreview({
  price,
  location,
  rooms,
  area,
  pricePerM2,
  className,
  style,
  onClose,
}: MapOfferPreviewProps) {
  return (
    <section
      className={cn(styles.MapOfferPreviewContainer, className)}
      style={style}
    >
      <section className={styles.MapOfferContent}>
        <div className={styles.MapOfferImage}>
          <img src={OfferImage} alt="Offer image" className={styles.offerImg} />
          <button
            className={cn(styles.paginationBtn, styles.paginationBtnLeft)}
          >
            <PaginationArrowLeftIcon />
          </button>
          <button
            className={cn(styles.paginationBtn, styles.paginationBtnRight)}
          >
            <PaginationArrowRightIcon />
          </button>
          <div className={styles.imageIndicator}>
            <ImageIcon />
            <p>1 / 18</p>
          </div>
        </div>

        <div className={styles.MapOfferDetails}>
          <h3 className={styles.offerPrice}>{price.toLocaleString()} zł</h3>

          <div className={styles.offerInfo}>
            <div className={styles.offerLocation}>
              <LocationIcon />
              <p className="font-paragraph">{location}</p>
            </div>
            <div className={styles.offerAdditionalInfo}>
              <p className="font-paragraph">{rooms} rooms</p>
              <div className={styles.divider} />
              <p className="font-paragraph">{area} m²</p>
              <div className={styles.divider} />
              <p className="font-paragraph">
                {pricePerM2.toLocaleString()} zł/m²
              </p>
            </div>
          </div>

          <section className={styles.offerActions}>
            <PrimaryButton
              style={{ justifyContent: "center" }}
              variant="light"
              label="Close"
              onClick={onClose}
            />
            <PrimaryButton
              style={{ justifyContent: "center" }}
              variant="dark"
              label="See offer"
              onClick={() => {}}
            />
          </section>
        </div>
      </section>
    </section>
  );
}
