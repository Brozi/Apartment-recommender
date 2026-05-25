import { cn } from "../../lib/utils";
import styles from "./select.module.css";

type SelectProps = {
  className?: string;
  onClick?: () => void;
  label: string;
  info: string;
  icon?: React.ReactNode;
};

export default function Select({
  className,
  onClick,
  label,
  icon,
  info,
}: SelectProps) {
  return (
    <button className={cn(styles.select, className)} onClick={onClick}>
      <div className={styles.textGroup}>
        <span className="font-select-info">{info}</span>
        <span className="font-secondary-button">{label}</span>
      </div>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.cornerAccent} aria-hidden="true" />
    </button>
  );
}
