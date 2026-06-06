import { useFieldContext } from ".";
import { FieldGroup, FieldLegend, FieldSet } from "../ui/field";
import FormButton from "../ui/form-button";
import { FieldErrors } from "./field-errors";

type ChoiceChipOption = {
  label: string;
  value: string;
};

type ChoiceChipsFieldProps = {
  label: string;
  options: ChoiceChipOption[];
  className?: string;
  type?: "single" | "multi";
};

export const ChoiceChipsField = ({
  label,
  options,
  className,
  type = "single",
}: ChoiceChipsFieldProps) => {
  const field = useFieldContext<string | string[]>();
  const { errors, isTouched } = field.state.meta;
  const isInvalid = isTouched && errors.length > 0;

  const handleSingleChange = (optionValue: string, isSelected: boolean) => {
    if (!isSelected) {
      field.handleChange(optionValue);
    } else {
      field.handleChange("");
    }
  };

  const handleMultiChange = (optionValue: string, isSelected: boolean) => {
    const currentValues = Array.isArray(field.state.value)
      ? field.state.value
      : [];
    let newValues: string[];

    if (optionValue === "any") {
      newValues = isSelected ? [] : ["any"];
    } else {
      if (currentValues.includes("any")) {
        newValues = [optionValue];
      } else {
        newValues = isSelected
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];
      }

      const nonAnyOptions = options
        .filter((o) => o.value !== "any")
        .map((o) => o.value);
      const hasAllNonAnySelected = nonAnyOptions.every((val) =>
        newValues.includes(val),
      );

      if (hasAllNonAnySelected) {
        newValues = ["any"];
      }
    }

    field.handleChange(newValues);
  };

  return (
    <FieldSet>
      <FieldLegend>{label}</FieldLegend>
      <FieldGroup
        style={
          className
            ? undefined
            : {
                display: "grid",
                gap: "var(--spacing-8)",
                gridTemplateColumns: `repeat(${options.length}, 1fr)`,
              }
        }
        className={className}
      >
        {options.map((option) => {
          const isSelected =
            type === "multi"
              ? Array.isArray(field.state.value) &&
                field.state.value.includes(option.value)
              : field.state.value === option.value;
          return (
            <FormButton
              isSelected={isSelected}
              key={option.value}
              dataInvalid={isInvalid}
              type="button"
              onClick={() => {
                if (type === "multi") {
                  handleMultiChange(option.value, isSelected);
                } else {
                  handleSingleChange(option.value, isSelected);
                }
              }}
            >
              {option.label}
            </FormButton>
          );
        })}
      </FieldGroup>

      <FieldErrors isInvalid={isInvalid} meta={field.state.meta} />
    </FieldSet>
  );
};
