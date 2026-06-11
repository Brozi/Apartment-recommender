import { Outlet, createFileRoute } from "@tanstack/react-router";

import styles from "#/routes/dashboard/layout.module.css";
import Pagination from "#/components/dashboard-pagination/pagination";
import BtnGroup from "#/components/subpage-header/btn-group";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import { useDashboardPaginationModel } from "#/store/useDashboardPagination";
import { Button } from "#/components/ui/button";
import ChevronDownIcon from "#/components/icons/chevron-down-icon";

export const Route = createFileRoute("/dashboard/__layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const paginationModel = useDashboardPaginationModel();

  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <div className={styles.titleWrapper}>
          <SubpageHeaderTitle label="Dashboard" />
          <div className={styles.divider} />
          <Pagination model={paginationModel} />
        </div>
        <BtnGroup className={styles.btnGroup}>
          <Button
            className={styles.select}
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
            className={styles.select}
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
            May 2026
            <ChevronDownIcon size={20} />
          </Button>
          {/* <Select
            className={styles.select}
            label="Cracow"
            info="City:"
            icon={<SelectArrowIcon />}
            onClick={() => {}}
          />
          <Select
            className={styles.select}
            label="May 2026"
            info="Date:"
            icon={<SelectArrowIcon />}
            onClick={() => {}}
          /> */}
        </BtnGroup>
      </SubpageHeader>

      <Outlet />
    </>
  );
}
