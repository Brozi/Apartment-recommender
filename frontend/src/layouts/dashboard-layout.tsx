import { Outlet } from "react-router";
import Pagination from "../components/dashboard-pagination/pagination";

export default function DashboardLayout() {
  return (
    <>
      <Pagination />

      <main>
        <Outlet />
      </main>
    </>
  );
}
