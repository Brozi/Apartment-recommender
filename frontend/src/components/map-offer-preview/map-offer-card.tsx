import { useState } from "react";
import { useOfferDetails } from "#/api/useOfferDetails";
import OfferImage from "#/assets/offer-img.webp";
import styles from "#/components/map-offer-preview/map-offer-card.module.css";
import { Button } from "../ui/button";

type MapOfferCardProps = {
  offerId: string;
  rank: number;
};

export default function MapOfferCard({ offerId, rank }: MapOfferCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { data: offer, isPending, error } = useOfferDetails(offerId);

  if (isPending) {
    return (
      <div className={styles.cardSkeleton}>
        <div className={styles.cardSkeletonImg} />
        <div className={styles.cardSkeletonBody}>
          <div className={styles.cardSkeletonLine} style={{ width: "60%" }} />
          <div className={styles.cardSkeletonLine} style={{ width: "80%" }} />
          <div className={styles.cardSkeletonLine} style={{ width: "50%" }} />
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className={styles.card}>
        <div className={styles.details}>
          <span className="font-base">Failed to load</span>
        </div>
      </div>
    );
  }

  const imageSrc = offer.photoUrls.length > 0 ? offer.photoUrls[0] : OfferImage;
  const locationLabel = [offer.district, offer.street]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt="Offer image"
          className={styles.image}
          style={{
            opacity: isImageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
          onLoad={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && <div className={styles.imageSkeleton} />}
        <span className={`${styles.rankBadge} font-indicator`}>#{rank}</span>
      </div>

      <div className={styles.details}>
        <div className={styles.price}>
          <span className="font-highlight">
            {offer.price.toLocaleString()} zł
          </span>
          <span className="font-addon-main">
            {offer.pricePerM2.toLocaleString()} zł/m²
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className="font-base">{offer.area} m²</span>
          <div className={styles.divider} />
          <span className="font-base">{offer.rooms} rooms</span>
        </div>

        {locationLabel && (
          <span className="font-base" style={{ lineHeight: 1.5 }}>
            {locationLabel}
          </span>
        )}
      </div>

      <div className={styles.action}>
        <Button
          variant="primary"
          size="default"
          onClick={() =>
            window.open(offer.link, "_blank", "noopener,noreferrer")
          }
          style={{ width: "100%" }}
        >
          See offer
        </Button>
      </div>
    </article>
  );
}
