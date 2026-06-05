import { useMemo } from "react";
import { useFieldContext } from ".";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "../ui/combobox";
import { Field, FieldLabel } from "../ui/field";
import { FieldErrors } from "./field-errors";

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxFieldProps = {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  isInvalid: boolean;
};

export const ComboboxField = ({
  label,
  options,
  placeholder,
  isInvalid,
}: ComboboxFieldProps) => {
  const field = useFieldContext<string[]>();
  const optionsByValue = useMemo(() => {
    return new Map(options.map((option) => [option.value, option]));
  }, [options]);
  const comboboxAnchor = useComboboxAnchor();

  const handleValueChange = (newValues: string[]) => {
    const oldValues = field.state.value as string[];
    const values = newValues ?? [];

    const justSelectedAll =
      values.includes("all") && !oldValues.includes("all");

    if (justSelectedAll) {
      field.handleChange(["all"]);
      return;
    }

    if (
      oldValues.includes("all") &&
      values.includes("all") &&
      values.length > 1
    ) {
      field.handleChange(values.filter((v) => v !== "all"));
      return;
    }

    const otherDistrictsCount = options.length - 1;
    const selectedOthersCount = values.filter((v) => v !== "all").length;

    if (selectedOthersCount === otherDistrictsCount) {
      field.handleChange(["all"]);
      return;
    }

    field.handleChange(values);
  };

  return (
    <Field>
      <FieldLabel htmlFor="select-districts">{label}</FieldLabel>
      <Combobox
        name={field.name}
        multiple
        value={field.state.value}
        onValueChange={handleValueChange}
        items={options}
      >
        <ComboboxChips dataInvalid={isInvalid} ref={comboboxAnchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => {
                  const option = optionsByValue.get(value);
                  return option ? (
                    <ComboboxChip key={option.value}>
                      {option.label}
                    </ComboboxChip>
                  ) : null;
                })}
                <ComboboxChipsInput
                  id="select-districts"
                  placeholder={placeholder}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={comboboxAnchor}>
          <ComboboxEmpty>No {label} found</ComboboxEmpty>
          <ComboboxList>
            {(item: ComboboxOption) => (
              <ComboboxItem
                data-selected={field.state.value.includes(item.value)}
                key={item.value}
                value={item.value}
              >
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <FieldErrors isInvalid={isInvalid} meta={field.state.meta} />
    </Field>
  );
};
