import styles from "./loading-spinner.module.css";

type LoadingSpinnerProps = {
  label?: string;
};

export default function LoadingSpinner({
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
