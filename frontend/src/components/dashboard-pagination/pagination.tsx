import { useRouterState } from "@tanstack/react-router";

import { DASHBOARD_PAGINATION_DATA } from "#/lib/constants";
import PaginationButton from "#/components/dashboard-pagination/pagination-button";
import arrowLeft from "#/assets/arrow-left.svg";
import arrowRight from "#/assets/arrow-right.svg";
import styles from "#/components/dashboard-pagination/pagination.module.css";
import PaginationInfoWrapper from "#/components/dashboard-pagination/pagination-info-wrapper";

export default function Pagination() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const dashboardBasePath = "/dashboard";
  const currentPath = pathname.split("/").pop() || "";

  const currentIndex = DASHBOARD_PAGINATION_DATA.findIndex(
    (step) => step.path === currentPath,
  );
  const totalSteps = DASHBOARD_PAGINATION_DATA.length;

  const prevIndex = (currentIndex - 1 + totalSteps) % totalSteps;
  const nextIndex = (currentIndex + 1) % totalSteps;

  if (currentIndex === -1) return null;

  return (
    <section className={styles.pagination}>
      <PaginationButton
        path={`${dashboardBasePath}/${DASHBOARD_PAGINATION_DATA[prevIndex].path}`}
      >
        <img src={arrowLeft} alt="Arrow left icon" />
      </PaginationButton>

      <PaginationInfoWrapper
        currentIndex={currentIndex}
        totalSteps={totalSteps}
        label={DASHBOARD_PAGINATION_DATA[currentIndex].label}
      />

      <PaginationButton
        path={`${dashboardBasePath}/${DASHBOARD_PAGINATION_DATA[nextIndex].path}`}
      >
        <img src={arrowRight} alt="Arrow right icon" />
      </PaginationButton>
    </section>
  );
}
