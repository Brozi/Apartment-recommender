import { useFieldContext } from ".";
import { Input } from "../ui/input";

type NumberFieldProps = {
  placeholder?: string;
  unit?: string;
  maxValue?: number;
  id?: string;
};

export const NumberField = ({
  placeholder,
  unit,
  maxValue,
  id,
}: NumberFieldProps) => {
  const field = useFieldContext<number>();

  return (
    <Input
      id={id}
      unit={unit}
      name={field.name}
      value={field.state.value}
      onChange={(e) => {
        const cleanValue = e.target.value.replace(/\D/g, "");
        const numericValue = Number(cleanValue);

        if (maxValue !== undefined && numericValue > maxValue) {
          field.handleChange(maxValue);
        } else {
          field.handleChange(numericValue);
        }
      }}
      placeholder={placeholder}
      data-invalid={field.state.meta.errors.length > 0}
      style={{ flex: 1 }}
    />
  );
};
