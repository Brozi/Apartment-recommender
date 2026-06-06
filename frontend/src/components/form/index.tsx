import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { SelectField } from "./select-field";
import { ComboboxField } from "./combobox-field";
import { ChoiceChipsField } from "./choice-chips-field";
import { NumberField } from "./number-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    SelectField,
    ComboboxField,
    ChoiceChipsField,
    NumberField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
