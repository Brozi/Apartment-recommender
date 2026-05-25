import { cn } from "../../lib/utils";
import styles from "./primary-button.module.css";

type PrimaryButtonProps = {
  className?: string;
  onClick?: () => void;
  label: string;
  icon?: React.ReactNode;
  variant?: "light" | "dark";
  style?: React.CSSProperties;
};

export default function PrimaryButton({
  style,
  className,
  onClick,
  label,
  icon,
  variant,
}: PrimaryButtonProps) {
  return variant === "light" ? (
    <button
      className={cn(styles.primaryButton, className)}
      onClick={onClick}
      style={style}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className="font-primary-button-light">{label}</span>
      <div className={styles.cornerAccent} aria-hidden="true" />
    </button>
  ) : (
    <button
      className={cn(styles.primaryButtonDark, className)}
      onClick={onClick}
      style={style}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className="font-primary-button-dark">{label}</span>
      <div className={styles.cornerAccentDark} aria-hidden="true" />
    </button>
  );
}
