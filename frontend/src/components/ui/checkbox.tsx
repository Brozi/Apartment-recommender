import { Checkbox as CheckboxBase } from "@base-ui/react/checkbox";
import { cn } from "#/lib/utils";

import CheckIcon from "../icons/check-icon";
import styles from "./checkbox.module.css";

function Checkbox({ className, ...props }: CheckboxBase.Root.Props) {
  return (
    <CheckboxBase.Root
      data-slot="checkbox"
      className={cn(styles.root, className)}
      {...props}
    >
      <CheckboxBase.Indicator
        data-slot="checkbox-indicator"
        className={styles.indicator}
      >
        <CheckIcon strokeWidth={2.5} size={16} color="var(--clr-light-100)" />
      </CheckboxBase.Indicator>
    </CheckboxBase.Root>
  );
}

export { Checkbox };
