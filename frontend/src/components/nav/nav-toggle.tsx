import { cn } from "#/lib/utils";

import styles from "#/components/nav/nav.module.css";
import navCloseIcon from "#/assets/nav-close.svg";
import navMenuIcon from "#/assets/nav-menu.svg";

type NavToggleProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function NavToggle({ isOpen, onClick }: NavToggleProps) {
  return (
    <button
      className={cn(styles.navToggle, styles.iconContainer)}
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <img src={isOpen ? navCloseIcon : navMenuIcon} alt="Menu icon" />
    </button>
  );
}
