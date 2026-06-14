import { useFieldContext } from ".";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel } from "../ui/field";
import { FieldErrors } from "./field-errors";

type CheckboxFieldProps = {
  id: string;
  label: string;
  style?: React.CSSProperties;
};

export const CheckboxField = ({ id, label, style }: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();
  const { errors, isTouched } = field.state.meta;
  const isInvalid = isTouched && errors.length > 0;

  return (
    <Field orientation="horizontal" style={style}>
      <Checkbox
        checked={field.state.value}
        name={id}
        onCheckedChange={() => field.handleChange(!field.state.value)}
      />
      <FieldLabel
        style={{ paddingBottom: "1px" }}
        htmlFor={id}
        fontType="paragraph"
      >
        {label}
      </FieldLabel>

      <FieldErrors isInvalid={isInvalid} meta={field.state.meta} />
    </Field>
  );
};
