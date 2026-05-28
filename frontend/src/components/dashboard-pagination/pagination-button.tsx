import { Link } from "@tanstack/react-router";

import styles from "#/components/dashboard-pagination/pagination.module.css";

type PaginationButtonProps = {
  children: React.ReactNode;
  path: string;
};

export default function PaginationButton({
  children,
  path,
}: PaginationButtonProps) {
  return (
    <Link className={styles.paginationButton} to={path}>
      {children}
    </Link>
  );
}
