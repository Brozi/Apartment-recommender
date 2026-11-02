import { useFieldContext } from ".";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { FieldErrors } from "./field-errors";

type TextFieldProps = {
  placeholder?: string;
  unit?: string;
  id?: string;
  onlyNumbers?: boolean;
  decimals?: number;
  variant: "bare" | "full"; // bare: only input, full: input with label and errors
  label?: string;
  style?: React.CSSProperties;
  invisible?: boolean;
  className?: string;
};

export const TextField = ({
  placeholder,
  unit,
  id,
  onlyNumbers,
  decimals,
  variant = "bare",
  label,
  style,
  invisible = false,
  className,
}: TextFieldProps) => {
  const field = useFieldContext<string>();
  const { errors, isTouched } = field.state.meta;
  const isInvalid = isTouched && errors.length > 0;
  const styleHide = invisible ? { display: "none" } : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (onlyNumbers) {
      if (decimals !== undefined) {
        value = value.replace(/[^\d.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) {
          value = parts[0] + "." + parts.slice(1).join("");
        }
        if (parts.length === 2 && parts[1].length > decimals) {
          value = parts[0] + "." + parts[1].slice(0, decimals);
        }
      } else {
        value = value.replace(/\D/g, "");
      }
    }

    field.handleChange(value);

    if (field.state.meta.isTouched) {
      field.validate("blur");
    }
  };
  if (variant === "bare") {
    return (
      <Input
        className={className}
        id={id}
        unit={unit}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={handleChange}
        placeholder={placeholder}
        data-invalid={isInvalid}
        style={{ ...style, ...styleHide }}
      />
    );
  }

  if (variant === "full") {
    return (
      <Field className={className}>
        <FieldLabel style={styleHide} htmlFor={id}>
          {label}
        </FieldLabel>
        <Input
          id={id}
          unit={unit}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={handleChange}
          placeholder={placeholder}
          data-invalid={isInvalid}
          style={{ ...style, ...styleHide }}
        />
        <FieldErrors isInvalid={isInvalid} meta={field.state.meta} />
      </Field>
    );
  }
};
