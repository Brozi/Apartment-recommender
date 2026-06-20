import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";
import CloseIcon from "#/components/icons/close-icon";
import LoadingSpinner from "#/components/ui/loading-spinner";
import MapOfferCard from "#/components/map-offer-preview/map-offer-card";
import { useOfferRecommendations } from "#/api/useOfferRecommendations";
import styles from "#/components/map-forms/map-form-box.module.css";
import boxStyles from "#/components/map-offer-preview/map-offer-box.module.css";

const PAGE_SIZE = 4;

type MapOfferBoxProps = {
  isActive: boolean;
  onCloseOfferBox: () => void;
  sessionHash: string;
};

export default function MapOfferBox({
  isActive,
  onCloseOfferBox,
  sessionHash,
}: MapOfferBoxProps) {
  const { data, isPending, error } = useOfferRecommendations(sessionHash);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setVisibleCount(PAGE_SIZE);
      scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isActive, sessionHash]);

  useEffect(() => {
    if (!data || !sentinelRef.current) return;

    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, data.length));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [data, visibleCount]);

  const visibleItems = data?.slice(0, visibleCount) ?? [];
  const totalCount = data?.length ?? 0;

  return (
    <div
      className={cn(styles.formBg, isActive ? styles.active : styles.disabled)}
    >
      <section className={cn(styles.formBox, boxStyles.wideBox)}>
        <header className={styles.formHeader}>
          <div>
            <h1 className="font-h1">Recommended offers</h1>
            {!isPending && !error && (
              <span
                className="font-paragraph"
                style={{ color: "var(--clr-primary-80)" }}
              >
                {totalCount} {totalCount === 1 ? "result" : "results"}
              </span>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={onCloseOfferBox}
            aria-label="Close offers"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.divider} />

        {isPending && <LoadingSpinner label="Loading recommendations" />}

        {error && (
          <p className="font-paragraph" style={{ color: "var(--clr-error)" }}>
            Failed to load recommendations
          </p>
        )}

        {!isPending && !error && data && (
          <div ref={scrollRef} className={boxStyles.scrollContainer}>
            <div className={boxStyles.offersGrid}>
              {visibleItems.map((rec) => (
                <MapOfferCard key={rec.id} offerId={rec.id} rank={rec.rank} />
              ))}
            </div>

            {visibleCount < totalCount && (
              <div ref={sentinelRef} className={boxStyles.sentinel} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
