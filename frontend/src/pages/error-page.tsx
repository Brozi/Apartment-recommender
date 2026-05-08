import { useRouteError } from "react-router";

import styles from "./error-page.module.css";

type ErrorWithMessage = {
  statusText?: string;
  message?: string;
};

export default function ErrorPage() {
  const error = useRouteError() as ErrorWithMessage;
  const message = error?.statusText || error?.message || "Unexpected error";

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.subtitle}>{message}</p>
      </section>
    </main>
  );
}
