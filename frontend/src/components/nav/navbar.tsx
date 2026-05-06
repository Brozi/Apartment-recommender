import { useState } from "react";

import styles from "./nav.module.css";
import Logo from "./logo";
import NavItems from "./nav-items";
import NavItem from "./nav-item";
import NavToggle from "./nav-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigationData = [
    { label: "MAP", path: "/" },
    { label: "DASHBOARD", path: "/dashboard/kpis" },
    { label: "VALUATION", path: "/valuation" },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <Logo />

        <NavItems isOpen={isOpen}>
          {navigationData.map((item) => (
            <NavItem
              key={item.path}
              label={item.label}
              path={item.path}
              isActive={window.location.pathname === item.path}
            />
          ))}
        </NavItems>

        <NavToggle isOpen={isOpen} onClick={toggleMenu} />
      </nav>
      <div className={styles.divider} />
    </header>
  );
}
