import { useOffers } from "#/api/useOffers";
import { createFileRoute } from "@tanstack/react-router";

import styles from "#/routes/map-page.module.css";
import FilterIcon from "#/components/icons/filter-icon";
import FormIcon from "#/components/icons/form-icon";
import SelectArrowIcon from "#/components/icons/select-arrow-icon";
import Map from "#/components/interactive-map/map";
import MapOfferContainer from "#/components/map-offer-preview/map-offer-container";
import BtnGroup from "#/components/subpage-header/btn-group";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import Button from "#/components/ui/button";
import LoadingSpinner from "#/components/ui/loading-spinner";
import Select from "#/components/ui/select";
import MapContextProvider from "#/contexts/map-context-provider";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  const { data: mapOffers, isPending, error } = useOffers();

  if (isPending) {
    return <LoadingSpinner label="Loading map" />;
  }

  if (error || !mapOffers) {
    return <p className="text-paragraph">Failed to load map</p>;
  }

  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Interactive map" />
        <BtnGroup className={styles.btnGroup}>
          <Select
            className={styles.select}
            label="Cracow"
            info="City:"
            icon={<SelectArrowIcon />}
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
            onClick={() => {}}
          />
        </BtnGroup>
      </SubpageHeader>

      <section className={styles.mapSection}>
        <MapContextProvider mapOffers={mapOffers}>
          <Map />
          <MapOfferContainer />
        </MapContextProvider>
      </section>
    </>
  );
}
