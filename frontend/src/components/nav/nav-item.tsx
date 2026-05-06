import { cn } from "../../utils/utils";

import styles from "./nav.module.css";

type NavItemProps = {
  className?: string;
  isActive: boolean;
  style?: React.CSSProperties;
  label: string;
  path: string;
};

export default function NavItem({ isActive, label, path }: NavItemProps) {
  return (
    <li>
      <a
        className={`${cn(styles.navItem, ".font-nav-button")} ${isActive ? styles.active : ""}`}
        href={path}
      >
        {label}
      </a>
    </li>
  );
}
