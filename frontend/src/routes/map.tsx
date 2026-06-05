import { useEffect, useState } from "react";
import { useOffers } from "#/api/useOffers";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { createFileRoute } from "@tanstack/react-router";

import styles from "#/routes/map-page.module.css";
import FilterIcon from "#/components/icons/filter-icon";
import FormIcon from "#/components/icons/form-icon";
import Map from "#/components/interactive-map/map";
import MapOfferContainer from "#/components/map-offer-preview/map-offer-container";
import BtnGroup from "#/components/subpage-header/btn-group";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import Button from "#/components/ui/button";
import MapContextProvider from "#/contexts/map-context-provider";
import type { MapViewport } from "#/lib/types";
import MapFormBox from "#/components/map-forms/map-form-box";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  const [isFilterFormActive, setIsFilterFormActive] = useState(false);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const debouncedViewport = useDebouncedValue(viewport, 300);
  const { data: mapData, isPending, error } = useOffers(debouncedViewport);

  useEffect(() => {
    if (!isFilterFormActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterFormActive]);

  const handleFilterFormOpen = () => {
    setIsFilterFormActive(true);
  };

  const handleFilterFormClose = () => {
    setIsFilterFormActive(false);
  };

  if (error) {
    return <p className="text-paragraph">Failed to load map</p>;
  }

  const safeMapData = mapData ?? {
    offers: { items: [] },
    offersInPoint: { items: [] },
    clusters: { items: [] },
  };

  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Interactive map" />
        <BtnGroup className={styles.btnGroup}>
          <Button
            variant="secondary"
            className={styles.primaryButton}
            icon={<FormIcon />}
            label="Cracow"
            onClick={() => {}}
          />
          <Button
            variant="secondary"
            className={styles.primaryButton}
            icon={<FormIcon />}
            label="Reccommendation form"
            onClick={() => {}}
          />
          <Button
            variant="secondary"
            className={styles.primaryButton}
            icon={<FilterIcon />}
            label="Filter map"
            onClick={handleFilterFormOpen}
          />
        </BtnGroup>
      </SubpageHeader>

      <section className={styles.mapSection}>
        <MapContextProvider mapData={safeMapData}>
          <Map onViewportChange={setViewport} />
          <MapOfferContainer />
        </MapContextProvider>
      </section>

      <MapFormBox
        isActive={isFilterFormActive}
        type="filter"
        onCloseForm={handleFilterFormClose}
      />
    </>
  );
}
