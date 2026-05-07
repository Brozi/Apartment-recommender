import { NavLink } from "react-router";

import styles from "./pagination.module.css";

type PaginationButtonProps = {
  children: React.ReactNode;
  path: string;
};

export default function PaginationButton({
  children,
  path,
}: PaginationButtonProps) {
  return (
    <NavLink className={styles.paginationButton} to={path}>
      {children}
    </NavLink>
  );
}
