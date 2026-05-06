import { NavLink } from "react-router";
import styles from "./nav.module.css";

type NavItemProps = {
  className?: string;
  style?: React.CSSProperties;
  label: string;
  onClick: () => void;
  path: string;
};

export default function NavItem({ label, path, onClick }: NavItemProps) {
  return (
    <li>
      <NavLink
        className={({ isActive }) =>
          `${styles.navItem} font-nav-button ${isActive ? styles.active : ""}`
        }
        to={path}
        end={path === "/"}
        onClick={onClick}
      >
        <span className={styles.navItemText}>{label}</span>
      </NavLink>
    </li>
  );
}
