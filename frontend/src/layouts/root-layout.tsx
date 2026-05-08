import { Outlet } from "react-router";

import styles from "./root-layout.module.css";
import Navbar from "../components/nav/navbar";

export default function RootLayout() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
