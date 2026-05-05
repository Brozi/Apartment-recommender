import { Outlet } from "react-router";
import styles from "./root-layout.module.css";

export default function RootLayout() {
  return (
    <>
      <nav className={styles.nav}>Nav</nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
