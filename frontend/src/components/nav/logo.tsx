import { NavLink } from "react-router";

import styles from "./nav.module.css";
import logoIcon from "../../assets/logo.svg";

export default function Logo() {
  return (
    <NavLink className={styles.logoContainer} to="/">
      <div className={styles.iconContainer}>
        <img src={logoIcon} alt="logo icon" />
      </div>
      <span className="font-logo">APRTS</span>
    </NavLink>
  );
}
