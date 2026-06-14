import {
  createFilterFormSchema,
  mapFilterLimitsResponse,
  mapFormOptions,
  recommendationFormSchema,
  type FilterLimits,
} from "#/feature/forms/map-form-options";
import { useAppForm } from "../form";
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { Step1FilterForm } from "#/feature/forms/step1-filter-form";
import { Step2RecommendationForm } from "#/feature/forms/step2-recommendation-form";
import { useFilterLimits } from "#/api/useFIlterLimits";
import LoadingSpinner from "../ui/loading-spinner";
import { cleanFilters, encodeFiltersToURL } from "#/lib/filter-url-utils";
import { useMapContext } from "#/hooks/use-map-context";

type MapFormProps = {
  step: number;
  setStep: (step: number) => void;
  onCloseForm: () => void;
};

export default function MapForm({ step, setStep, onCloseForm }: MapFormProps) {
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

  return (
    <MapFormReady
      step={step}
      setStep={setStep}
      limits={limits}
      onCloseForm={onCloseForm}
    />
  );
}

type MapFormReadyProps = MapFormProps & { limits: FilterLimits };

function MapFormReady({
  step,
  setStep,
  limits,
  onCloseForm,
}: MapFormReadyProps) {
  const { clearSelection } = useMapContext();
  const navigate = useNavigate({ from: "/map" });
  const filterSchema = createFilterFormSchema(limits);

  const form = useAppForm({
    ...mapFormOptions,
    validationLogic: revalidateLogic(),
    validators: {
      onChange: z.object({
        step1: filterSchema,
        step2: recommendationFormSchema,
      }),
    },
    onSubmit: ({ value }) => {
      clearSelection();
      onCloseForm();
      setStep(0);
      const cleaned = cleanFilters(value);
      if (!cleaned) return;
      const encoded = encodeFiltersToURL(cleaned);
      void navigate({ to: "/map", search: { f: encoded } });
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
