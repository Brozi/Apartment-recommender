import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <>
      <p className="text-paragraph">pagination</p>

      <main>
        <Outlet />
      </main>
    </>
  );
}
