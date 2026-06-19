import { useMemo } from "react";
import { useOfferIDsByPoint } from "#/api/useOfferIDsByPoint";
import { useMapContext } from "#/hooks/use-map-context";
import MapOfferBlank from "#/components/map-offer-preview/map-offer-blank";
import styles from "#/components/map-offer-preview/map-offer-container.module.css";
import MapOfferPreview from "#/components/map-offer-preview/map-offer-preview";
import OfferBgAddon from "#/assets/offer-bg-addon.svg";
import Pagination from "../dashboard-pagination/pagination";
import { useOfferPaginationModel } from "#/store/useOfferPagination";

export default function MapOfferContainer() {
  const { selectedOfferId, selectedOffersInPoint, clearSelection, mapData } =
    useMapContext();

  const pointOfferIDs = selectedOffersInPoint?.offers?.map((o) => o.id);
  const useDirectIDs = Boolean(pointOfferIDs?.length);

  const hasPointSelection = Boolean(selectedOffersInPoint) && !useDirectIDs;
  const selectedLat = selectedOffersInPoint?.lat ?? null;
  const selectedLng = selectedOffersInPoint?.lng ?? null;

  const { data: offerIDsData } = useOfferIDsByPoint(
    selectedLat,
    selectedLng,
    hasPointSelection,
  );

  const offerIDs = pointOfferIDs ?? offerIDsData?.offerIDs ?? [];
  const { currentOfferId, pagination } = useOfferPaginationModel({
    offerIDs,
    selectedOfferId,
    selectedOffersInPoint,
  });

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const offer of mapData.offers.items) {
      if (offer.rank) map.set(offer.id, offer.rank);
    }
    for (const point of mapData.offersInPoint.items) {
      for (const o of point.offers ?? []) {
        if (o.rank) map.set(o.id, o.rank);
      }
    }
    return map;
  }, [mapData]);

  const currentRank = currentOfferId ? rankMap.get(currentOfferId) : undefined;
  const resultsCount = mapData.resultsCount;

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
            rank={currentRank}
            resultsCount={resultsCount}
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
