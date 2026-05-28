import styles from "#/components/ui/loading-spinner.module.css";

type LoadingSpinnerProps = {
  label?: string;
  style?: React.CSSProperties;
};

export default function LoadingSpinner({
  label = "Loading",
  style,
}: LoadingSpinnerProps) {
  return (
    <div
      style={style}
      className={styles.wrapper}
      role="status"
      aria-live="polite"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
