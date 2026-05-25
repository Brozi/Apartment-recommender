import { useState } from "react";

import styles from "./nav.module.css";
import Logo from "./logo";
import NavItems from "./nav-items";
import NavItem from "./nav-item";
import NavToggle from "./nav-toggle";
import { NAVIGATION_DATA } from "../../lib/constants";

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
            {NAVIGATION_DATA.map((item) => (
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
