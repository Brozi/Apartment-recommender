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
  label?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const SelectField = ({
  label,
  options,
  placeholder,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const selectAnchor = useSelectAnchor();

  const { isTouched, errors } = field.state.meta;
  const isInvalid = isTouched && errors.length > 0;

  return (
    <Field>
      {label && <FieldLabel htmlFor="select-condition">{label}</FieldLabel>}
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(newValue) => field.handleChange(newValue ?? "")}
      >
        <SelectTrigger id="select-condition" dataInvalid={isInvalid}>
          <SelectValue placeholder={placeholder}>
            {options.find((o) => o.value === field.state.value)?.label ||
              field.state.value}
          </SelectValue>
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
