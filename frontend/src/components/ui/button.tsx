import { Button as ButtonBase } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

import styles from "#/components/ui/button.module.css";

const buttonVariants = cva(styles.baseButton, {
  variants: {
    variant: {
      primary: styles.buttonPrimary,
      secondary: styles.buttonSecondary,
      outline: styles.buttonOutline,
      destructive: styles.buttonDestructive,
    },
    size: {
      small: styles.buttonSmall, // 2.5rem
      default: styles.buttonDefault, // 3rem
      large: styles.buttonLarge, // 3.5rem
      iconSmall: styles.buttonIconSmall, // 2.5rem
      iconDefault: styles.buttonIconDefault, // 3rem
      iconLarge: styles.buttonIconLarge, // 3.5rem
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "large",
  },
});

const cornerVariants = cva(styles.corner, {
  variants: {
    cornerColor: {
      red: styles.cornerRed,
      green: styles.cornerGreen,
      none: "",
    },
  },
});

function Button({
  className,
  variant = "primary",
  size = "large",
  cornerColor = "none",
  ...props
}: ButtonBase.Props &
  VariantProps<typeof buttonVariants> &
  VariantProps<typeof cornerVariants>) {
  return (
    <ButtonBase
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
        "font-button",
      )}
      {...props}
    >
      {props.children}
      {cornerColor !== "none" && (
        <div className={cornerVariants({ cornerColor })} aria-hidden="true" />
      )}
    </ButtonBase>
  );
}

export { Button, buttonVariants };

// type ButtonProps = {
//   className?: string;
//   onClick?: () => void;
//   label?: string;
//   icon?: React.ReactNode;
//   variant?: "secondary" | "primary" | "secondary-icon" | "primary-icon";
//   style?: React.CSSProperties;
//   type?: "button" | "submit" | "reset";
//   form?: string;
// };

// export default function Button({
//   style,
//   className,
//   onClick,
//   label,
//   icon,
//   variant,
//   ...props
// }: ButtonProps) {
//   const buttonStyle =
//     variant === "secondary" || variant === "secondary-icon"
//       ? styles.secondaryButton
//       : styles.primaryButton;
//   const labelStyle =
//     variant === "secondary" || variant === "secondary-icon"
//       ? "font-secondary-button"
//       : "font-primary-button";
//   const cornerAccentStyle =
//     variant === "secondary" || variant === "secondary-icon"
//       ? styles.cornerAccentSecondary
//       : styles.cornerAccentPrimary;

//   return (
//     <button
//       className={cn(buttonStyle, className)}
//       onClick={onClick}
//       style={style}
//       {...props}
//     >
//       {variant === "secondary-icon" || (variant === "primary-icon" && icon) ? (
//         <>{icon}</>
//       ) : (
//         <span className={styles.icon}>{icon}</span>
//       )}
//       {label && <span className={labelStyle}>{label}</span>}
//       <div className={cornerAccentStyle} aria-hidden="true" />
//     </button>
//   );
// }
