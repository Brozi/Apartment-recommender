import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import styles from "./field.module.css";
import { cn } from "#/lib/utils";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(styles.fieldSet, className)}
      {...props}
    />
  );
}

const Field = React.forwardRef<
  React.ElementRef<typeof BaseField.Root>,
  React.ComponentPropsWithoutRef<typeof BaseField.Root>
>(({ className, ...props }, ref) => (
  <BaseField.Root ref={ref} className={cn(styles.root, className)} {...props} />
));
Field.displayName = "Field";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(styles.fieldGroup, className)}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(styles.label, className)}
      {...props}
    />
  );
}

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof BaseField.Label>,
  React.ComponentPropsWithoutRef<typeof BaseField.Label>
>(({ className, ...props }, ref) => (
  <BaseField.Label
    ref={ref}
    className={cn(styles.label, className, "font-input-label")}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

const FieldControl = React.forwardRef<
  React.ElementRef<typeof BaseField.Control>,
  React.ComponentPropsWithoutRef<typeof BaseField.Control>
>(({ className, ...props }, ref) => (
  <BaseField.Control
    ref={ref}
    className={cn(styles.control, className, "font-input")}
    {...props}
  />
));
FieldControl.displayName = "FieldControl";

const FieldDescription = React.forwardRef<
  React.ElementRef<typeof BaseField.Description>,
  React.ComponentPropsWithoutRef<typeof BaseField.Description>
>(({ className, ...props }, ref) => (
  <BaseField.Description
    ref={ref}
    className={cn(styles.description, className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = React.useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return (
        <ul className={styles.errorList}>
          <li
            className="font-text"
            style={{ color: "var(--clr-error-text)", lineHeight: 1.6 }}
          >
            {uniqueErrors[0]?.message}
          </li>
        </ul>
      );
    }

    return (
      <ul className={styles.errorList}>
        {uniqueErrors.map(
          (error, index) =>
            error?.message && (
              <li
                className="font-text"
                style={{ color: "var(--clr-error-text)", lineHeight: 1.6 }}
                key={index}
              >
                {error.message}
              </li>
            ),
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("font-text", className)}
      style={{ color: "red" }}
      {...props}
    >
      {content}
    </div>
  );
}

const FieldItem = React.forwardRef<
  React.ElementRef<typeof BaseField.Item>,
  React.ComponentPropsWithoutRef<typeof BaseField.Item>
>(({ className, ...props }, ref) => (
  <BaseField.Item ref={ref} className={cn(styles.item, className)} {...props} />
));
FieldItem.displayName = "FieldItem";

const FieldValidity = BaseField.Validity;

export {
  FieldSet,
  Field,
  FieldGroup,
  FieldLegend,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldValidity,
};
