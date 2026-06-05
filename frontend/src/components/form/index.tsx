import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { SelectField } from "./select-field";
import { ComboboxField } from "./combobox-filed";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { SelectField, ComboboxField },
  formComponents: {},
  fieldContext,
  formContext,
});
