import * as z from "zod";
import { formOptions } from "@tanstack/react-form";

export type Step1FormValues = {
  buildingType: string;
  districts: string[];
  totalPrice: {
    totalPriceFrom: number;
    totalPriceTo: number;
  };
  pricePerM2: {
    pricePerM2From: number;
    pricePerM2To: number;
  };
  area: {
    areaFrom: number;
    areaTo: number;
  };
  buildYear: {
    buildYearFrom: number;
    buildYearTo: number;
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
    totalPriceFrom: 0,
    totalPriceTo: 10000000,
  },
  pricePerM2: {
    pricePerM2From: 0,
    pricePerM2To: 20000,
  },
  area: {
    areaFrom: 0,
    areaTo: 200,
  },
  buildYear: {
    buildYearFrom: 1900,
    buildYearTo: 2028,
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
  defaults: Step1FormValues = STEP1_DEFAULT_VALUES,
): Pick<Step2FormValues, "buildingPartImportance" | "poisImportance"> {
  const buildingPartImportance: Step2FormValues["buildingPartImportance"] = [];

  if (step1.buildingType !== defaults.buildingType) {
    buildingPartImportance.push({
      part: "building_type",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (hasSelectedValue(step1.districts, "all")) {
    buildingPartImportance.push({
      part: "districts",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.totalPrice.totalPriceFrom !== defaults.totalPrice.totalPriceFrom ||
    step1.totalPrice.totalPriceTo !== defaults.totalPrice.totalPriceTo
  ) {
    buildingPartImportance.push({
      part: "total_price",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.pricePerM2.pricePerM2From !== defaults.pricePerM2.pricePerM2From ||
    step1.pricePerM2.pricePerM2To !== defaults.pricePerM2.pricePerM2To
  ) {
    buildingPartImportance.push({
      part: "price_per_m2",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.area.areaFrom !== defaults.area.areaFrom ||
    step1.area.areaTo !== defaults.area.areaTo
  ) {
    buildingPartImportance.push({
      part: "area",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (
    step1.buildYear.buildYearFrom !== defaults.buildYear.buildYearFrom ||
    step1.buildYear.buildYearTo !== defaults.buildYear.buildYearTo
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

  if (step1.marketType !== defaults.marketType) {
    buildingPartImportance.push({
      part: "market_type",
      importance: DEFAULT_IMPORTANCE,
    });
  }

  if (step1.condition !== defaults.condition) {
    buildingPartImportance.push({
      part: "condition",
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

export const filterFormSchema = z
  .object({
    buildingType: z.string().min(1, "You must select a building type"),
    districts: z.array(z.string()).min(1, "Select at least one district"),
    totalPrice: z.object({
      totalPriceFrom: z
        .number()
        .min(0)
        .max(10000000, "Price must be between 0 and 10000000"),
      totalPriceTo: z
        .number()
        .min(0)
        .max(10000000, "Price must be between 0 and 10000000"),
    }),
    pricePerM2: z.object({
      pricePerM2From: z
        .number()
        .min(0)
        .max(20000, "Price per m² must be between 0 and 20000"),
      pricePerM2To: z
        .number()
        .min(0)
        .max(20000, "Price per m² must be between 0 and 20000"),
    }),
    area: z.object({
      areaFrom: z.number().min(0).max(200, "Area must be between 0 and 200"),
      areaTo: z.number().min(0).max(200, "Area must be between 0 and 200"),
    }),
    buildYear: z.object({
      buildYearFrom: z
        .number()
        .min(1900, "Build year must be between 1900 and 2028")
        .max(2028, "Build year must be between 1900 and 2028"),
      buildYearTo: z
        .number()
        .min(1900, "Build year must be between 1900 and 2028")
        .max(2028, "Build year must be between 1900 and 2028"),
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
    (data) => data.totalPrice.totalPriceTo >= data.totalPrice.totalPriceFrom,
    {
      message: "Maximum price must be greater than or equal to minimum price",
      path: ["totalPrice", "totalPriceTo"],
    },
  )
  .refine(
    (data) => data.pricePerM2.pricePerM2To >= data.pricePerM2.pricePerM2From,
    {
      message:
        "Maximum price per m² must be greater than or equal to minimum price per m²",
      path: ["pricePerM2", "pricePerM2To"],
    },
  )
  .refine((data) => data.area.areaTo >= data.area.areaFrom, {
    message: "Maximum area must be greater than or equal to minimum area",
    path: ["area", "areaTo"],
  })
  .refine(
    (data) => data.buildYear.buildYearTo >= data.buildYear.buildYearFrom,
    {
      message: "Build year to must be greater than or equal to build year from",
      path: ["buildYear", "buildYearTo"],
    },
  );

export const recommendationFormSchema = z.object({
  skipRecommendation: z.boolean(),
  buildingPartImportance: z.array(
    z.object({ part: z.string(), importance: z.number().min(0).max(100) }),
  ),
  poisImportance: z.array(
    z.object({ poi: z.string(), importance: z.number().min(0).max(100) }),
  ),
});

export const mapFormOptions = formOptions({
  defaultValues: {
    step1: STEP1_DEFAULT_VALUES,
    step2: {
      skipRecommendation: false,
      ...buildStep2FromStep1(STEP1_DEFAULT_VALUES),
    },
  },
});
