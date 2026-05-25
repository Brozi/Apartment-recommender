import { useEffect, useState } from "react";
import { useMapContext } from "../../hooks/use-map-context";
import MapOfferBlank from "./map-offer-blank";
import styles from "./map-offer-container.module.css";
import MapOfferPreview from "./map-offer-preview";
import OfferBgAddon from "../../assets/offer-bg-addon.svg";
import LoadingSpinner from "../ui/loading-spinner";
import { fetchOfferDetails } from "../../services/offer-details-loader";
import type { OfferDetailsResponse } from "../../lib/types";

export default function MapOfferContainer() {
  const { isSelected, selectedOffer, clearSelection } = useMapContext();
  const [details, setDetails] = useState<OfferDetailsResponse | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  const selectedOfferId = selectedOffer?.id ?? null;
  const activeDetails = details?.id === selectedOfferId ? details : null;
  const activeError = error?.id === selectedOfferId ? error.message : null;
  const isLoading = !!selectedOfferId && !activeDetails && !activeError;

  // TODO: Zmienić na react query później żeby nie było takiego pierdolnika
  useEffect(() => {
    if (!selectedOfferId) {
      return;
    }

    let isActive = true;

    fetchOfferDetails({ id: selectedOfferId })
      .then((data) => {
        if (!isActive) {
          return;
        }
        setDetails(data);
        setError(null);
      })
      .catch((fetchError) => {
        if (!isActive) {
          return;
        }
        setError({
          id: selectedOfferId,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load offer details",
        });
      });

    return () => {
      isActive = false;
    };
  }, [selectedOfferId]);

  return (
    <div className={styles.mapOfferContainer}>
      {isSelected && selectedOffer ? (
        <>
          {isLoading && <LoadingSpinner label="Loading offer" />}
          {!isLoading && activeError && (
            <div className={styles.errorState}>{activeError}</div>
          )}
          {!isLoading && !activeError && activeDetails && (
            <MapOfferPreview offer={activeDetails} onClose={clearSelection} />
          )}
          {!isLoading && !activeError && !activeDetails && (
            <LoadingSpinner label="Loading offer" />
          )}
          <img
            className={styles.offerBgAddon}
            src={OfferBgAddon}
            alt="offer background addon"
          />
        </>
      ) : (
        <MapOfferBlank />
      )}
    </div>
  );
}
