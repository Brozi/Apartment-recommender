import { Outlet, createFileRoute } from "@tanstack/react-router";

import styles from "#/routes/dashboard/layout.module.css";
import Pagination from "#/components/dashboard-pagination/pagination";
import SelectArrowIcon from "#/components/icons/select-arrow-icon";
import BtnGroup from "#/components/subpage-header/btn-group";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import Select from "#/components/ui/select";
import { useDashboardPaginationModel } from "#/store/useDashboardPagination";

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
          <Select
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
          />
        </BtnGroup>
      </SubpageHeader>

      <Outlet />
    </>
  );
}
