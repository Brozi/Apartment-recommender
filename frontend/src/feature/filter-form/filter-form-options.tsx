import * as z from "zod";
import { formOptions } from "@tanstack/react-form";

const filterFormSchema = z
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

export const filterFormOptions = formOptions({
  defaultValues: {
    buildingType: "any",
    districts: ["all"] as string[],
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
    rooms: ["any"] as string[],
    marketType: "any",
    condition: "any",
    pois: [{ poi: "parcel_locker", range: "500_m" }] as {
      poi: string;
      range: string;
    }[],
  },
  validators: {
    onChange: filterFormSchema,
  },
});
