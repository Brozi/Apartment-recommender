import { useOfferIDsByPoint } from "#/api/useOfferIDsByPoint";
import { useMapContext } from "#/hooks/use-map-context";
import MapOfferBlank from "#/components/map-offer-preview/map-offer-blank";
import styles from "#/components/map-offer-preview/map-offer-container.module.css";
import MapOfferPreview from "#/components/map-offer-preview/map-offer-preview";
import OfferBgAddon from "#/assets/offer-bg-addon.svg";
import Pagination from "../dashboard-pagination/pagination";
import { useOfferPaginationModel } from "#/store/useOfferPagination";

export default function MapOfferContainer() {
  const { selectedOfferId, selectedOffersInPoint, clearSelection } =
    useMapContext();

  const hasPointSelection = Boolean(selectedOffersInPoint);
  const selectedLat = selectedOffersInPoint?.lat ?? null;
  const selectedLng = selectedOffersInPoint?.lng ?? null;

  const { data: offerIDsData } = useOfferIDsByPoint(
    selectedLat,
    selectedLng,
    hasPointSelection,
  );

  const offerIDs = offerIDsData?.offerIDs ?? [];
  const { currentOfferId, pagination } = useOfferPaginationModel({
    offerIDs,
    selectedOfferId,
    selectedOffersInPoint,
  });

  return (
    <div className={styles.mapOfferContainer}>
      {!currentOfferId && <MapOfferBlank />}
      {currentOfferId && (
        <>
          {pagination && (
            <Pagination
              style={{ marginBottom: "var(--spacing-24)" }}
              model={pagination}
            />
          )}
          <MapOfferPreview
            selectedOfferId={currentOfferId}
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
