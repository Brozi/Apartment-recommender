import { useLocation } from "react-router";

import { DASHBOARD_PAGINATION_DATA } from "../../lib/constants";
import PaginationButton from "./pagination-button";
import arrowLeft from "../../assets/arrow-left.svg";
import arrowRight from "../../assets/arrow-right.svg";
import styles from "./pagination.module.css";
import PaginationInfoWrapper from "./pagination-info-wrapper";
import PaginationAddon from "./pagination-addon";

export default function Pagination() {
  const { pathname } = useLocation();

  const currentPath = pathname.split("/").pop() || "";

  const currentIndex = DASHBOARD_PAGINATION_DATA.findIndex(
    (step) => step.path === currentPath,
  );
  const totalSteps = DASHBOARD_PAGINATION_DATA.length;

  const prevIndex = (currentIndex - 1 + totalSteps) % totalSteps;
  const nextIndex = (currentIndex + 1) % totalSteps;

  if (currentIndex === -1) return null;

  return (
    <section className={styles.paginationContainer}>
      <section className={styles.pagination}>
        <PaginationButton path={DASHBOARD_PAGINATION_DATA[prevIndex].path}>
          <img src={arrowLeft} alt="Arrow left icon" />
        </PaginationButton>

        <PaginationInfoWrapper
          currentIndex={currentIndex}
          totalSteps={totalSteps}
          label={DASHBOARD_PAGINATION_DATA[currentIndex].label}
        />

        <PaginationButton path={DASHBOARD_PAGINATION_DATA[nextIndex].path}>
          <img src={arrowRight} alt="Arrow right icon" />
        </PaginationButton>
      </section>

      <PaginationAddon
        direction="left"
        className={styles.paginationAddonLeft}
      />
      <PaginationAddon
        direction="right"
        className={styles.paginationAddonRight}
      />
    </section>
  );
}
