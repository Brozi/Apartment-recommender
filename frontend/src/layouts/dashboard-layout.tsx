import { Outlet, useNavigation } from "react-router";
import Pagination from "../components/dashboard-pagination/pagination";
import LoadingSpinner from "../components/ui/loading-spinner";

export default function DashboardLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  return (
    <>
      <Pagination />

      <main>
        {isLoading ? <LoadingSpinner label="Loading data" /> : <Outlet />}
      </main>
    </>
  );
}
