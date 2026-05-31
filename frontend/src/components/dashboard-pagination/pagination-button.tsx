import { Link } from "@tanstack/react-router";

import styles from "#/components/dashboard-pagination/pagination.module.css";

type PaginationButtonProps = {
  children: React.ReactNode;
  path?: string;
  type?: "nav" | "action";
  onClick?: () => void;
};

export default function PaginationButton({
  children,
  path,
  type = "nav",
  onClick,
}: PaginationButtonProps) {
  return (
    <>
      {type === "nav" ? (
        <Link className={styles.paginationButton} to={path}>
          {children}
        </Link>
      ) : (
        <button className={styles.paginationButton} onClick={onClick}>
          {children}
        </button>
      )}
    </>
  );
}
