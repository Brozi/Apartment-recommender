import {
  filterFormSchema,
  mapFormOptions,
  recommendationFormSchema,
} from "#/feature/forms/map-form-options";
import { useAppForm } from "../form";
import { revalidateLogic } from "@tanstack/react-form";
import z from "zod";
import { Step1FilterForm } from "#/feature/forms/step1-filter-form";
import { Step2RecommendationForm } from "#/feature/forms/step2-recommendation-form";

type MapFormProps = {
  step: number;
  setStep: (step: number) => void;
};

export default function MapForm({ step, setStep }: MapFormProps) {
  const form = useAppForm({
    ...mapFormOptions,
    validationLogic: revalidateLogic(),
    validators: {
      onChange: z.object({
        step1: filterFormSchema,
        step2: recommendationFormSchema,
      }),
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <>
      {step === 0 && (
        <Step1FilterForm form={form} step={step} setStep={setStep} />
      )}

      {step === 1 && (
        <Step2RecommendationForm form={form} step={step} setStep={setStep} />
      )}
    </>
  );
}
