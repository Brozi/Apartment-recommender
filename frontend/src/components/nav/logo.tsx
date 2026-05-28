import { Link } from "@tanstack/react-router";

import styles from "#/components/nav/nav.module.css";
import logoIcon from "#/assets/logo.svg";

export default function Logo() {
  return (
    <Link className={styles.logoContainer} to="/">
      <div className={styles.iconContainer}>
        <img src={logoIcon} alt="logo icon" />
      </div>
      <span className="font-logo">APRTS</span>
    </Link>
  );
}
