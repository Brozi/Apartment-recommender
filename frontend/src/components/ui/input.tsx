import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import styles from "./input.module.css";
import { cn } from "#/lib/utils";

type InputAdditionalProps = {
  dataInvalid?: boolean;
  unit?: string;
};

const Input = React.forwardRef<
  React.ElementRef<typeof BaseInput>,
  React.ComponentPropsWithoutRef<typeof BaseInput> & InputAdditionalProps
>(({ className, dataInvalid, unit, ...props }, ref) => {
  const isInvalid = dataInvalid ? "true" : "false";

  return (
    <div
      className={cn(styles.wrapper, className)}
      data-has-unit={unit ? "true" : "false"}
    >
      <BaseInput
        ref={ref}
        className={styles.input}
        data-invalid={isInvalid}
        {...props}
      />
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
