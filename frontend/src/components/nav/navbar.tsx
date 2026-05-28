import { useState } from "react";

import styles from "#/components/nav/nav.module.css";
import Logo from "#/components/nav/logo";
import NavItems from "#/components/nav/nav-items";
import NavItem from "#/components/nav/nav-item";
import NavToggle from "#/components/nav/nav-toggle";
import { NAVIGATION_ROUTES } from "#/lib/navRoutes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <section className={styles.navContent}>
          <Logo />

          <NavItems isOpen={isOpen}>
            {NAVIGATION_ROUTES.map((item) => (
              <NavItem
                key={item.path}
                label={item.label}
                path={item.path}
                onClick={closeMenu}
              />
            ))}
          </NavItems>

          <NavToggle isOpen={isOpen} onClick={toggleMenu} />
        </section>
      </nav>
      <div className={styles.divider} />
    </header>
  );
}
