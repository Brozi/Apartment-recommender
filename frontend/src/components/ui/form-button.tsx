import { cn } from "#/lib/utils";
import CheckIcon from "../icons/check-icon";
import styles from "./form-button.module.css";

type FormButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  dataInvalid?: boolean;
  style?: React.CSSProperties;
  className?: string;
  isSelected?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function FormButton({
  children,
  onClick,
  dataInvalid,
  style,
  className,
  isSelected,
  type = "button",
}: FormButtonProps) {
  return (
    <button
      type={type}
      style={style}
      className={cn(
        styles.button,
        "font-input",
        className,
        isSelected ? styles.buttonSelected : styles.buttonDefault,
      )}
      onClick={onClick}
      data-invalid={dataInvalid ? "true" : "false"}
    >
      {children}
      {isSelected && <CheckIcon size={16} className={styles.checkIcon} />}
    </button>
  );
}
