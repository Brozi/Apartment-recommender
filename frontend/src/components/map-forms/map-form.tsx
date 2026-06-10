import {
  createFilterFormSchema,
  createMapFormOptions,
  mapFilterLimitsResponse,
  recommendationFormSchema,
  type FilterLimits,
} from "#/feature/forms/map-form-options";
import { useAppForm } from "../form";
import { revalidateLogic } from "@tanstack/react-form";
import z from "zod";
import { Step1FilterForm } from "#/feature/forms/step1-filter-form";
import { Step2RecommendationForm } from "#/feature/forms/step2-recommendation-form";
import { useFilterLimits } from "#/api/useFIlterLimits";
import LoadingSpinner from "../ui/loading-spinner";

type MapFormProps = {
  step: number;
  setStep: (step: number) => void;
};

export default function MapForm({ step, setStep }: MapFormProps) {
  const { data: filterLimitsResponse, isPending, error } = useFilterLimits();

  if (isPending) {
    return (
      <LoadingSpinner label="Loading filters" style={{ margin: "auto" }} />
    );
  }

  if (error || !filterLimitsResponse) {
    return <p>Failed to load filter limits</p>;
  }

  const limits = mapFilterLimitsResponse(filterLimitsResponse);

  return <MapFormReady step={step} setStep={setStep} limits={limits} />;
}

type MapFormReadyProps = MapFormProps & { limits: FilterLimits };

function MapFormReady({ step, setStep, limits }: MapFormReadyProps) {
  const options = createMapFormOptions(limits);
  const filterSchema = createFilterFormSchema(limits);

  const form = useAppForm({
    ...options,
    validationLogic: revalidateLogic(),
    validators: {
      onChange: z.object({
        step1: filterSchema,
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
        <Step1FilterForm
          form={form}
          step={step}
          setStep={setStep}
          limits={limits}
        />
      )}
      {step === 1 && (
        <Step2RecommendationForm form={form} step={step} setStep={setStep} />
      )}
    </>
  );
}
