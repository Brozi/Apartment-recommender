import { cn } from "#/lib/utils";
import styles from "#/components/ui/button.module.css";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  label: string;
  icon?: React.ReactNode;
  variant?: "secondary" | "primary";
  style?: React.CSSProperties;
};

export default function Button({
  style,
  className,
  onClick,
  label,
  icon,
  variant,
}: ButtonProps) {
  const buttonStyle =
    variant === "secondary" ? styles.secondaryButton : styles.primaryButton;
  const labelStyle =
    variant === "secondary" ? "font-secondary-button" : "font-primary-button";
  const cornerAccentStyle =
    variant === "secondary"
      ? styles.cornerAccentSecondary
      : styles.cornerAccentPrimary;

  return (
    <button
      className={cn(buttonStyle, className)}
      onClick={onClick}
      style={style}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={labelStyle}>{label}</span>
      <div className={cornerAccentStyle} aria-hidden="true" />
    </button>
  );
}
