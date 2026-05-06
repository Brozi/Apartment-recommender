import { useState } from "react";

import styles from "./nav.module.css";
import Logo from "./logo";
import NavItems from "./nav-items";
import NavItem from "./nav-item";
import NavToggle from "./nav-toggle";
import { cn } from "../../utils/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navigationData = [
    { label: "Map", path: "/map" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Valuation", path: "/valuation" },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navSide}>
          <Logo />
        </div>

        <NavItems isOpen={isOpen}>
          {navigationData.map((item) => (
            <NavItem
              key={item.path}
              label={item.label}
              path={item.path}
              onClick={closeMenu}
            />
          ))}
        </NavItems>

        <div className={cn(styles.navSide, styles.navSideEnd)}>
          <NavToggle isOpen={isOpen} onClick={toggleMenu} />
        </div>
      </nav>
      <div className={styles.divider} />
    </header>
  );
}
