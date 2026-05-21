import styles from "./map-page.module.css";
import SubpageHeader from "../components/subpage-header/subpage-header";
import SubpageHeaderTitle from "../components/subpage-header/subpage-header-title";
import BtnGroup from "../components/subpage-header/btn-group";
import PrimaryButton from "../components/ui/primary-button";
import FormIcon from "../components/icons/form-icon";
import Select from "../components/ui/select";
import SelectArrowIcon from "../components/icons/select-arrow-icon";
import FilterIcon from "../components/icons/filter-icon";
import Map from "../components/interactive-map/map";
import MapAddonLeft from "../assets/map-addon-left.svg";
import MapAddonRight from "../assets/map-addon-right.svg";

export default function MapPage() {
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
            variant="light"
            className={styles.primaryButton}
            icon={<FormIcon />}
            label="Reccommendation form"
            onClick={() => {}}
          />
          <PrimaryButton
            variant="light"
            className={styles.primaryButton}
            icon={<FilterIcon />}
            label="Filter map"
            onClick={() => {}}
          />
        </BtnGroup>
      </SubpageHeader>

      <section className={styles.mapSection}>
        <img
          src={MapAddonLeft}
          alt="Map addon left"
          className={styles.mapAddon}
        />
        <Map />
        <img
          src={MapAddonRight}
          alt="Map addon right"
          className={styles.mapAddon}
        />
      </section>
    </>
  );
}
