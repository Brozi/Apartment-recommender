import { Outlet } from "react-router";
import Navbar from "../components/nav/navbar";

export default function RootLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  );
}
