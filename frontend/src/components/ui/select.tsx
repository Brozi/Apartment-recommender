import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import styles from "./select.module.css";
import { cn } from "#/lib/utils";
import CheckIcon from "../icons/check-icon";
import ChevronDownIcon from "../icons/chevron-down-icon";

const Select = BaseSelect.Root;
const SelectGroup = BaseSelect.Group;
const SelectValue = BaseSelect.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof BaseSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger> & {
    dataInvalid?: boolean;
  }
>(({ className, dataInvalid, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(styles.trigger, className)}
    data-invalid={dataInvalid ? "true" : "false"}
    {...props}
  >
    {children}
    <span className={styles.icon}>
      <ChevronDownIcon size={16} />
    </span>
  </BaseSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({
  className,
  side = "bottom",
  sideOffset = 0,
  align = "center",
  alignOffset = 0,
  anchor,
  ...props
}: BaseSelect.Popup.Props &
  Pick<
    BaseSelect.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <BaseSelect.Popup className={cn(styles.popup, className)} {...props} />
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof BaseSelect.Item>,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item ref={ref} className={cn(styles.item, className)} {...props}>
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    <BaseSelect.ItemIndicator className={styles.itemIndicator}>
      <CheckIcon size={16} className={styles.checkIcon} />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof BaseSelect.Label>,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Label>
>(({ className, ...props }, ref) => (
  <BaseSelect.Label
    ref={ref}
    className={cn(styles.label, className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof BaseSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>
>(({ className, ...props }, ref) => (
  <BaseSelect.Separator
    ref={ref}
    className={cn(styles.separator, className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

function useSelectAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  useSelectAnchor,
};
