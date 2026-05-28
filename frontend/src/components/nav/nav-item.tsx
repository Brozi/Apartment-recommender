import { Link } from "@tanstack/react-router";
import styles from "#/components/nav/nav.module.css";

type NavItemProps = {
  className?: string;
  style?: React.CSSProperties;
  label: string;
  onClick: () => void;
  path: string;
};

export default function NavItem({ label, path, onClick }: NavItemProps) {
  const baseClassName = `${styles.navItem} font-nav-button`;

  return (
    <li>
      <Link
        className={baseClassName}
        to={path}
        activeOptions={{ exact: path === "/" }}
        activeProps={{ className: styles.active }}
        onClick={onClick}
      >
        <span className={styles.navItemText}>{label}</span>
      </Link>
    </li>
  );
}
