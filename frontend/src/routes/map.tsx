import { useEffect, useState } from "react";
import { useOffers } from "#/api/useOffers";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { createFileRoute } from "@tanstack/react-router";
import { decodeFiltersFromURL } from "#/lib/filter-url-utils";

import styles from "#/routes/map-page.module.css";
import FilterIcon from "#/components/icons/filter-icon";
import Map from "#/components/interactive-map/map";
import MapOfferContainer from "#/components/map-offer-preview/map-offer-container";
import BtnGroup from "#/components/subpage-header/btn-group";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import MapContextProvider from "#/contexts/map-context-provider";
import type { MapViewport } from "#/lib/types";
import MapFormBox from "#/components/map-forms/map-form-box";
import { Button } from "#/components/ui/button";
import { useSearchSession } from "#/api/useSearchSession";
import ChevronDownIcon from "#/components/icons/chevron-down-icon";
import { usePois } from "#/api/usePois";

export const Route = createFileRoute("/map")({
  validateSearch: (search: Record<string, unknown>) => ({
    f: (search.f as string | undefined) ?? undefined,
  }),
  component: MapPage,
});

function MapPage() {
  const { f } = Route.useSearch();
  const decodedFilters = f ? decodeFiltersFromURL(f) : null;
  const filtersExist = !!f;

  const { data: session } = useSearchSession(decodedFilters);
  const sessionHash = session?.sessionHash;

  const [isFilterFormActive, setIsFilterFormActive] = useState(false);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const debouncedViewport = useDebouncedValue(viewport, 300);
  const { data: mapData, error } = useOffers(
    debouncedViewport,
    sessionHash,
    filtersExist,
  );
  const { data: poisData, error: poisError } = usePois(debouncedViewport);
  console.log(poisData);

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

  if (error || poisError) {
    return <p className="text-paragraph">Failed to load map</p>;
  }

  const safeMapData = mapData ?? {
    offers: { items: [] },
    offersInPoint: { items: [] },
    clusters: { items: [] },
  };

  const safePoisData = poisData ?? {
    pois: [],
  };

  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Interactive map" />
        <BtnGroup className={styles.btnGroup}>
          <Button
            className={styles.secondaryButton}
            variant="secondary"
            // cornerColor="red"
            size="large"
            onClick={() => {}}
            style={{
              padding: "0 var(--spacing-16)",
              gap: "var(--spacing-24)",
              justifyContent: "space-between",
            }}
          >
            Cracow
            <ChevronDownIcon size={20} />
          </Button>
          <Button
            className={styles.secondaryButton}
            variant="secondary"
            // cornerColor="red"
            size="large"
            onClick={handleFilterFormOpen}
          >
            <FilterIcon />
            Filter map
          </Button>
        </BtnGroup>
      </SubpageHeader>

      <MapContextProvider mapData={safeMapData} poisData={safePoisData}>
        <section className={styles.mapSection}>
          <Map onViewportChange={setViewport} />
          <MapOfferContainer />
        </section>

        <MapFormBox
          isActive={isFilterFormActive}
          onCloseForm={handleFilterFormClose}
        />
      </MapContextProvider>
    </>
  );
}
