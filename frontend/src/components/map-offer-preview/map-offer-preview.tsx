import { cn } from "#/lib/utils";
import ImageIcon from "#/components/icons/image-icon";
import LocationIcon from "#/components/icons/location-icon";
import MeasureIcon from "#/components/icons/measure-icon";
import PaginationArrowLeftIcon from "#/components/icons/pagination-arrow-left-icon";
import PaginationArrowRightIcon from "#/components/icons/pagination-arrow-right-icon";
import styles from "#/components/map-offer-preview/map-offer-preview.module.css";
import OfferImage from "#/assets/offer-img.webp";
import Button from "#/components/ui/button";
import LeftCorner from "#/assets/left-corner-32.svg";
import { useOfferDetails } from "#/api/useOfferDetails";
import LoadingSpinner from "#/components/ui/loading-spinner";
import CloseIcon from "../icons/close-icon";

type MapOfferPreviewProps = {
  selectedOfferId: string;
  onClose?: () => void;
};

export default function MapOfferPreview({
  selectedOfferId,
  onClose,
}: MapOfferPreviewProps) {
  const {
    data: offerDetails,
    isPending,
    error,
  } = useOfferDetails(selectedOfferId);

  if (isPending) {
    return <LoadingSpinner label="Loading offer details" />;
  }

  if (error || !offerDetails) {
    return (
      <div className={styles.MapOfferContent}>Error loading offer details</div>
    );
  }

  const imageSrc = offerDetails.photoUrls[0] ?? OfferImage;
  const locationLabel = [offerDetails.district, offerDetails.street].join(", ");

  return (
    <section className={styles.MapOfferContent}>
      <div className={styles.MapOfferImage}>
        <img src={imageSrc} alt="Offer image" className={styles.offerImg} />
        <button onClick={onClose} className={styles.closeBtn}>
          <CloseIcon />
        </button>
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
          <h3 className="font-highlight">
            {offerDetails.price.toLocaleString()} zł
          </h3>
          <div className={cn(styles.divider, styles.sizeM)} />
          <span className="font-addon-main">
            {offerDetails.pricePerM2.toLocaleString()} zł/m²
          </span>
        </section>

        <div className={styles.offerInfo}>
          <div className={styles.offerInfoItem}>
            <LocationIcon />
            <p style={{ lineHeight: 1.6 }} className="font-base">
              {locationLabel}
            </p>
          </div>
          <div className={styles.offerInfoItem}>
            <MeasureIcon />
            <section className={cn(styles.multiList, styles.gapS)}>
              <p style={{ lineHeight: 1.6 }} className="font-base">
                {offerDetails.area} m²
              </p>
              <div className={cn(styles.divider, styles.sizeS)} />
              <p style={{ lineHeight: 1.6 }} className="font-base">
                {offerDetails.rooms} rooms
              </p>
            </section>
          </div>
        </div>
      </div>

      <div className={cn(styles.divider, styles.sizeL)} />

      <section className={styles.offerActions}>
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
