import * as z from "zod";
import { formOptions } from "@tanstack/react-form";
import type { FilterLimitsResponse } from "#/lib/types";
import { createOptionalNumericStringSchema } from "#/lib/utils";

export type Step1FormValues = {
  buildingType: string;
  districts: string[];
  totalPrice: {
    totalPriceFrom: string;
    totalPriceTo: string;
  };
  pricePerM2: {
    pricePerM2From: string;
    pricePerM2To: string;
  };
  area: {
    areaFrom: string;
    areaTo: string;
  };
  buildYear: {
    buildYearFrom: string;
    buildYearTo: string;
  };
  rooms: string[];
  marketType: string;
  condition: string;
  pois: Array<{ poi: string; range: string }>;
};

export type Step2FormValues = {
  skipRecommendation: boolean;
  buildingPartImportance: Array<{ part: string; importance: number }>;
  poisImportance: Array<{ poi: string; importance: number }>;
};

const DEFAULT_IMPORTANCE = 50;

export const STEP1_DEFAULT_VALUES: Step1FormValues = {
  buildingType: "any",
  districts: ["all"],
  totalPrice: {
    totalPriceFrom: "",
    totalPriceTo: "",
  },
  pricePerM2: {
    pricePerM2From: "",
    pricePerM2To: "",
  },
  area: {
    areaFrom: "",
    areaTo: "",
  },
  buildYear: {
    buildYearFrom: "",
    buildYearTo: "",
  },
  rooms: ["any"],
  marketType: "any",
  condition: "any",
  pois: [{ poi: "parcel_locker", range: "500_m" }],
};

const hasSelectedValue = (values: string[], sentinel: string): boolean =>
  !values.some((value) => value.toLowerCase() === sentinel.toLowerCase());

export function buildStep2FromStep1(
  step1: Step1FormValues,
): Pick<Step2FormValues, "buildingPartImportance" | "poisImportance"> {
  const buildingPartImportance: Step2FormValues["buildingPartImportance"] = [];

  if (
    step1.totalPrice.totalPriceFrom !== "" ||
    step1.totalPrice.totalPriceTo !== ""
  ) {
    buildingPartImportance.push({
      part: "total_price",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.pricePerM2.pricePerM2From !== "" ||
    step1.pricePerM2.pricePerM2To !== ""
  ) {
    buildingPartImportance.push({
      part: "price_per_m2",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (step1.area.areaFrom !== "" || step1.area.areaTo !== "") {
    buildingPartImportance.push({
      part: "area",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.buildYear.buildYearFrom !== "" ||
    step1.buildYear.buildYearTo !== ""
  ) {
    buildingPartImportance.push({
      part: "build_year",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (hasSelectedValue(step1.rooms, "any")) {
    buildingPartImportance.push({
      part: "rooms",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  const poisImportance: Step2FormValues["poisImportance"] = Array.from(
    new Set(step1.pois.map((item) => item.poi.trim()).filter(Boolean)),
  ).map((poi) => ({
    poi,
    importance: DEFAULT_IMPORTANCE,
  }));

  return {
    buildingPartImportance,
    poisImportance,
  };
}

export type FilterLimits = {
  totalPrice: { min: number; max: number };
  pricePerM2: { min: number; max: number };
  area: { min: number; max: number };
  buildYear: { min: number; max: number };
};

export function mapFilterLimitsResponse(
  response: FilterLimitsResponse,
): FilterLimits {
  return {
    totalPrice: { min: response.price.lower, max: response.price.upper },
    pricePerM2: {
      min: response.pricePerMeter.lower,
      max: response.pricePerMeter.upper,
    },
    area: { min: response.area.lower, max: response.area.upper },
    buildYear: { min: response.buildYear.lower, max: response.buildYear.upper },
  };
}

export const FILTER_LIMITS_FALLBACK: FilterLimits = {
  totalPrice: { min: 0, max: 20_000_000 },
  pricePerM2: { min: 0, max: 100_000 },
  area: { min: 0, max: 10_000 },
  buildYear: { min: 1500, max: 2028 },
};

export function createFilterFormSchema(
  limits: FilterLimits = FILTER_LIMITS_FALLBACK,
) {
  return z
    .object({
      buildingType: z.string().min(1, "You must select a building type"),
      districts: z.array(z.string()).min(1, "Select at least one district"),
      totalPrice: z.object({
        totalPriceFrom: createOptionalNumericStringSchema(
          limits.totalPrice.min,
          `Minimum price must be at least ${limits.totalPrice.min}`,
          limits.totalPrice.max,
          `Maximum price cannot exceed ${limits.totalPrice.max}`,
        ),
        totalPriceTo: createOptionalNumericStringSchema(
          limits.totalPrice.min,
          `Price must be at least ${limits.totalPrice.min}`,
          limits.totalPrice.max,
          `Price cannot exceed ${limits.totalPrice.max}`,
        ),
      }),
      pricePerM2: z.object({
        pricePerM2From: createOptionalNumericStringSchema(
          limits.pricePerM2.min,
          `Minimum price per m² must be at least ${limits.pricePerM2.min}`,
          limits.pricePerM2.max,
          `Price per m² cannot exceed ${limits.pricePerM2.max}`,
        ),
        pricePerM2To: createOptionalNumericStringSchema(
          limits.pricePerM2.min,
          `Price per m² must be at least ${limits.pricePerM2.min}`,
          limits.pricePerM2.max,
          `Price per m² cannot exceed ${limits.pricePerM2.max}`,
        ),
      }),
      area: z.object({
        areaFrom: createOptionalNumericStringSchema(
          limits.area.min,
          `Minimum area must be at least ${limits.area.min}`,
          limits.area.max,
          `Area cannot exceed ${limits.area.max}`,
        ),
        areaTo: createOptionalNumericStringSchema(
          limits.area.min,
          `Area must be at least ${limits.area.min}`,
          limits.area.max,
          `Area cannot exceed ${limits.area.max}`,
        ),
      }),
      buildYear: z.object({
        buildYearFrom: createOptionalNumericStringSchema(
          limits.buildYear.min,
          `Lower range of build year must be at least ${limits.buildYear.min}`,
          limits.buildYear.max,
          `Build year cannot exceed ${limits.buildYear.max}`,
        ),
        buildYearTo: createOptionalNumericStringSchema(
          limits.buildYear.min,
          `Upper range of build year must be at least ${limits.buildYear.min}`,
          limits.buildYear.max,
          `Build year cannot exceed ${limits.buildYear.max}`,
        ),
      }),
      rooms: z.array(z.string()).min(1, "Select at least one option"),
      marketType: z.string().min(1, "You must select a market type"),
      condition: z.string().min(1, "You must select a condition"),
      pois: z.array(z.object({ poi: z.string(), range: z.string() })),
    })
    .superRefine((data, ctx) => {
      const firstIndexByPoi = new Map<string, number>();

      data.pois.forEach((item, index) => {
        const normalizedPoi = item.poi.trim().toLowerCase();
        if (!normalizedPoi) {
          return;
        }

        const firstIndex = firstIndexByPoi.get(normalizedPoi);
        if (firstIndex === undefined) {
          firstIndexByPoi.set(normalizedPoi, index);
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each point of interest must be unique",
          path: ["pois", index, "poi"],
        });
      });
    })
    .refine(
      (data) => {
        const from = data.totalPrice.totalPriceFrom;
        const to = data.totalPrice.totalPriceTo;
        if (from === "" || to === "") return true;
        return Number(to) >= Number(from);
      },
      {
        message: "Minimum price must be less than or equal to maximum price",
        path: ["totalPrice", "totalPriceTo"],
      },
    )
    .refine(
      (data) => {
        const from = data.pricePerM2.pricePerM2From;
        const to = data.pricePerM2.pricePerM2To;
        if (from === "" || to === "") return true;
        return Number(to) >= Number(from);
      },
      {
        message:
          "Minimum price per m² must be less than or equal to maximum price per m²",
        path: ["pricePerM2", "pricePerM2To"],
      },
    )
    .refine(
      (data) => {
        const from = data.area.areaFrom;
        const to = data.area.areaTo;
        if (from === "" || to === "") return true;
        return Number(to) >= Number(from);
      },
      {
        message: "Minimum area must be less than or equal to maximum area",
        path: ["area", "areaTo"],
      },
    )
    .refine(
      (data) => {
        const from = data.buildYear.buildYearFrom;
        const to = data.buildYear.buildYearTo;
        if (from === "" || to === "") return true;
        return Number(to) >= Number(from);
      },
      {
        message: "Build year from must be less than or equal to build year to",
        path: ["buildYear", "buildYearTo"],
      },
    );
}

export const recommendationFormSchema = z.object({
  skipRecommendation: z.boolean(),
  buildingPartImportance: z.array(
    z.object({ part: z.string(), importance: z.number().min(0).max(100) }),
  ),
  poisImportance: z.array(
    z.object({ poi: z.string(), importance: z.number().min(0).max(100) }),
  ),
});

export const filterFormSchema = createFilterFormSchema();

export const mapFormOptions = formOptions({
  defaultValues: {
    step1: STEP1_DEFAULT_VALUES,
    step2: {
      skipRecommendation: false,
      ...buildStep2FromStep1(STEP1_DEFAULT_VALUES),
    },
  },
});
