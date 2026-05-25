import SelectArrowIcon from "../components/icons/select-arrow-icon";
import SubpageHeader from "../components/subpage-header/subpage-header";
import SubpageHeaderTitle from "../components/subpage-header/subpage-header-title";
import Select from "../components/ui/select";
import styles from "./valuation-page.module.css";

export default function ValuationPage() {
  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Valuation" />
        <Select
          className={styles.select}
          label="Cracow"
          info="City:"
          icon={<SelectArrowIcon />}
          onClick={() => {}}
        />
      </SubpageHeader>
    </>
  );
}
