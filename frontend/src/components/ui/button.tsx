import { cn } from "#/lib/utils";
import styles from "#/components/ui/button.module.css";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  label?: string;
  icon?: React.ReactNode;
  variant?: "secondary" | "primary" | "secondary-icon" | "primary-icon";
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  form?: string;
};

export default function Button({
  style,
  className,
  onClick,
  label,
  icon,
  variant,
  ...props
}: ButtonProps) {
  const buttonStyle =
    variant === "secondary" || variant === "secondary-icon"
      ? styles.secondaryButton
      : styles.primaryButton;
  const labelStyle =
    variant === "secondary" || variant === "secondary-icon"
      ? "font-secondary-button"
      : "font-primary-button";
  const cornerAccentStyle =
    variant === "secondary" || variant === "secondary-icon"
      ? styles.cornerAccentSecondary
      : styles.cornerAccentPrimary;

  return (
    <button
      className={cn(buttonStyle, className)}
      onClick={onClick}
      style={style}
      {...props}
    >
      {variant === "secondary-icon" || (variant === "primary-icon" && icon) ? (
        <>{icon}</>
      ) : (
        <span className={styles.icon}>{icon}</span>
      )}
      {label && <span className={labelStyle}>{label}</span>}
      <div className={cornerAccentStyle} aria-hidden="true" />
    </button>
  );
}
