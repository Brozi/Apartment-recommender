import { useState, useEffect } from "react";
import { cn } from "#/lib/utils";
import ImageIcon from "#/components/icons/image-icon";
import LocationIcon from "#/components/icons/location-icon";
import MeasureIcon from "#/components/icons/measure-icon";
import PaginationArrowLeftIcon from "#/components/icons/pagination-arrow-left-icon";
import PaginationArrowRightIcon from "#/components/icons/pagination-arrow-right-icon";
import styles from "#/components/map-offer-preview/map-offer-preview.module.css";
import OfferImage from "#/assets/offer-img.webp";
import LeftCorner from "#/assets/left-corner-32.svg";
import { useOfferDetails } from "#/api/useOfferDetails";
import LoadingSpinner from "#/components/ui/loading-spinner";
import CloseIcon from "../icons/close-icon";
import { Button } from "../ui/button";

type MapOfferPreviewProps = {
  selectedOfferId: string;
  onClose?: () => void;
  rank?: number;
  resultsCount?: number;
};

export default function MapOfferPreview({
  selectedOfferId,
  onClose,
  rank,
  resultsCount,
}: MapOfferPreviewProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
    setIsImageLoaded(false);
  }, [selectedOfferId]);

  const handleCloseOffer = () => {
    setPhotoIndex(0);
    setIsImageLoaded(false);
    if (onClose) {
      onClose();
    }
  };

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

  const photoCount = offerDetails.photoUrls.length;
  const imageSrc =
    photoCount > 0 ? offerDetails.photoUrls[photoIndex] : OfferImage;
  const locationLabel = [offerDetails.district, offerDetails.street].join(", ");

  const handlePrev = () => {
    setIsImageLoaded(false);
    setPhotoIndex((i) => (i - 1 + photoCount) % photoCount);
  };

  const handleNext = () => {
    setIsImageLoaded(false);
    setPhotoIndex((i) => (i + 1) % photoCount);
  };

  return (
    <section className={styles.MapOfferContent}>
      <div className={styles.MapOfferImage}>
        <img
          src={imageSrc}
          alt="Offer image"
          className={styles.offerImg}
          style={{
            opacity: isImageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
          onLoad={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && <div className={styles.offerImgSkeleton} />}
        <button onClick={handleCloseOffer} className={styles.closeBtn}>
          <CloseIcon />
        </button>
        <button
          className={cn(styles.paginationBtn, styles.paginationBtnLeft)}
          onClick={handlePrev}
          disabled={photoCount <= 1}
        >
          <PaginationArrowLeftIcon />
        </button>
        <button
          className={cn(styles.paginationBtn, styles.paginationBtnRight)}
          onClick={handleNext}
          disabled={photoCount <= 1}
        >
          <PaginationArrowRightIcon />
        </button>
        <div className={styles.imageIndicator}>
          <ImageIcon />
          <p className="font-indicator">
            {photoIndex + 1} / {photoCount}
          </p>
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

        {rank !== undefined && rank > 0 && (
          <section>
            <span
              style={{ color: "var(--clr-primary-100)" }}
              className="font-paragraph"
            >
              Match #{rank}
              {resultsCount && ` of ${resultsCount}`}
            </span>
          </section>
        )}

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
          variant="primary"
          size="large"
          onClick={() =>
            window.open(offerDetails.link, "_blank", "noopener,noreferrer")
          }
        >
          See offer
        </Button>
      </section>

      <img
        className={styles.leftCorner}
        src={LeftCorner}
        alt="left corner decoration"
      />
    </section>
  );
}
