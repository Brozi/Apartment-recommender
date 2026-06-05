import { useFieldContext } from ".";
import { Field, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useSelectAnchor,
} from "../ui/select";
import { FieldErrors } from "./field-errors";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  isInvalid: boolean;
};

export const SelectField = ({
  label,
  options,
  placeholder,
  isInvalid,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const selectAnchor = useSelectAnchor();

  return (
    <Field>
      <FieldLabel htmlFor="select-condition">{label}</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(newValue) => field.handleChange(newValue ?? "any")}
      >
        <SelectTrigger id="select-condition" dataInvalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent anchor={selectAnchor}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FieldErrors isInvalid={isInvalid} meta={field.state.meta} />
    </Field>
  );
};
