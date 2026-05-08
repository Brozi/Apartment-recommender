import styles from "./nav.module.css";

type NavItemsProps = {
  isOpen: boolean;
  children: React.ReactNode;
};

export default function NavItems({ children, isOpen }: NavItemsProps) {
  return (
    <ul className={`${styles.navItems} ${isOpen ? styles.open : ""}`}>
      {children}
    </ul>
  );
}
