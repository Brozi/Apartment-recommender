import styles from "#/components/nav/nav.module.css";
import navAddonLeft from "#/assets/nav-addon-left.svg";
import navAddonRight from "#/assets/nav-addon-right.svg";

type NavItemsProps = {
  isOpen: boolean;
  children: React.ReactNode;
};

export default function NavItems({ children, isOpen }: NavItemsProps) {
  return (
    <section className={styles.navItemsContainer}>
      <img
        className={styles.navAddon}
        src={navAddonLeft}
        alt="nav addon left"
      />
      <ul className={`${styles.navItems} ${isOpen ? styles.open : ""}`}>
        {children}
      </ul>
      <img
        className={styles.navAddon}
        src={navAddonRight}
        alt="nav addon right"
      />
    </section>
  );
}
