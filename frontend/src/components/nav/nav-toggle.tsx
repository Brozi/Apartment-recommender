import { cn } from "../../utils/utils";

import styles from "./nav.module.css";

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
      <img
        src={isOpen ? "./assets/nav-close.svg" : "./assets/nav-menu.svg"}
        alt="Menu icon"
      />
    </button>
  );
}
