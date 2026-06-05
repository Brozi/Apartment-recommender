import type { AnyFieldMeta } from "@tanstack/react-form";
import { FieldError } from "../ui/field";

type FieldErrorsProps = {
  isInvalid: boolean;
  meta: AnyFieldMeta;
};

export const FieldErrors = ({ isInvalid, meta }: FieldErrorsProps) => {
  if (!isInvalid) return null;

  return <FieldError errors={meta.errors} />;
};
