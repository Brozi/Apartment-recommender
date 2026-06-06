import { useFieldContext } from ".";
import { Input } from "../ui/input";

type NumberFieldProps = {
  placeholder?: string;
  unit?: string;
};

export const NumberField = ({ placeholder, unit }: NumberFieldProps) => {
  const field = useFieldContext<number>();

  return (
    <Input
      unit={unit}
      name={field.name}
      value={field.state.value}
      onChange={(e) => {
        const cleanValue = e.target.value.replace(/\D/g, "");
        field.handleChange(Number(cleanValue));
      }}
      placeholder={placeholder}
      data-invalid={field.state.meta.errors.length > 0}
      style={{ flex: 1 }}
    />
  );
};
