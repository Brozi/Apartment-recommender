import styles from "./map-page.module.css";
import SubpageHeader from "../components/subpage-header/subpage-header";
import SubpageHeaderTitle from "../components/subpage-header/subpage-header-title";
import BtnGroup from "../components/subpage-header/btn-group";
import PrimaryButton from "../components/ui/button";
import FormIcon from "../components/icons/form-icon";
import Select from "../components/ui/select";
import SelectArrowIcon from "../components/icons/select-arrow-icon";
import FilterIcon from "../components/icons/filter-icon";
import Map from "../components/interactive-map/map";
import MapOfferContainer from "../components/map-offer-preview/map-offer-container";
import MapContextProvider from "../contexts/map-context-provider";
import { useLoaderData, useNavigation } from "react-router";
import type { MapOffersResponse } from "../lib/types";
import LoadingSpinner from "../components/ui/loading-spinner";

export default function MapPage() {
  const mapOffers = useLoaderData() as MapOffersResponse[];
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

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
          <PrimaryButton
            variant="secondary"
            className={styles.primaryButton}
            icon={<FormIcon />}
            label="Reccommendation form"
            onClick={() => {}}
          />
          <PrimaryButton
            variant="secondary"
            className={styles.primaryButton}
            icon={<FilterIcon />}
            label="Filter map"
            onClick={() => {}}
          />
        </BtnGroup>
      </SubpageHeader>

      <section className={styles.mapSection}>
        {isLoading ? (
          <LoadingSpinner label="Loading map" />
        ) : (
          <MapContextProvider mapOffers={mapOffers}>
            <Map />
            <MapOfferContainer />
          </MapContextProvider>
        )}
      </section>
    </>
  );
}
