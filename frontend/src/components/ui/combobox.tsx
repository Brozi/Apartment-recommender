import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import styles from "./combobox.module.css";
import { cn } from "#/lib/utils";
import CloseIcon from "../icons/close-icon";
import CheckIcon from "../icons/check-icon";

const Combobox = BaseCombobox.Root;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.Input>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.Input>
>(({ className, ...props }, ref) => (
  <BaseCombobox.Input
    ref={ref}
    className={cn(styles.input, className)}
    {...props}
  />
));
ComboboxInput.displayName = "ComboboxInput";

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: BaseCombobox.Popup.Props &
  Pick<
    BaseCombobox.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <BaseCombobox.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(styles.popup, className)}
          {...props}
        />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.List>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.List>
>(({ className, ...props }, ref) => (
  <BaseCombobox.List
    ref={ref}
    className={cn(styles.list, className)}
    {...props}
  />
));
ComboboxList.displayName = "ComboboxList";

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.Item>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.Item>
>(({ className, children, ...props }, ref) => (
  <BaseCombobox.Item
    ref={ref}
    className={cn(styles.item, className)}
    {...props}
  >
    {children}
    <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
      <CheckIcon size={16} className={styles.checkIcon} />
    </BaseCombobox.ItemIndicator>
  </BaseCombobox.Item>
));

ComboboxItem.displayName = "ComboboxItem";

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.Empty>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.Empty>
>(({ className, ...props }, ref) => (
  <BaseCombobox.Empty
    ref={ref}
    data-slot="combobox-empty"
    className={cn(styles.empty, className)}
    {...props}
  />
));
ComboboxEmpty.displayName = "ComboboxEmpty";

const ComboboxChips = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.Chips>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.Chips> & {
    dataInvalid?: boolean;
  }
>(({ className, dataInvalid, ...props }, ref) => (
  <BaseCombobox.Chips
    ref={ref}
    className={cn(styles.chips, className)}
    data-invalid={dataInvalid ? "true" : "false"}
    {...props}
  />
));
ComboboxChips.displayName = "ComboboxChips";

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: BaseCombobox.Chip.Props & { showRemove?: boolean }) {
  return (
    <BaseCombobox.Chip
      data-slot="combobox-chip"
      className={cn(styles.chip, className)}
      {...props}
    >
      <p
        className="font-input"
        style={{ paddingBottom: "1px", color: "inherit", fontWeight: 500 }}
      >
        {children}
      </p>
      {showRemove && (
        <BaseCombobox.ChipRemove
          className={styles.chipRemove}
          data-slot="combobox-chip-remove"
        >
          <CloseIcon size={16} color="currentColor" />
        </BaseCombobox.ChipRemove>
      )}
    </BaseCombobox.Chip>
  );
}

const ComboboxChipsInput = React.forwardRef<
  React.ElementRef<typeof BaseCombobox.Input>,
  React.ComponentPropsWithoutRef<typeof BaseCombobox.Input>
>(({ className, ...props }, ref) => (
  <BaseCombobox.Input
    ref={ref}
    className={cn(styles.chipsInput, className)}
    {...props}
  />
));
ComboboxChipsInput.displayName = "ComboboxChipsInput";

const ComboboxValue = BaseCombobox.Value;

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
};
