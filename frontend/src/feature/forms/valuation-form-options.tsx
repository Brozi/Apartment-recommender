import { createNumericStringSchema } from "#/lib/utils";
import { formOptions } from "@tanstack/react-form";
import * as z from "zod";

const baseDefaultValues = {
  district: "",
  street: "",
  streetNumber: "",
  rooms: "",
  area: "",
  buildYear: "",
  condition: "",
  hasParking: false,
};

const baseValuationSchema = z.object({
  district: z.string().min(1, "You must select a district"),
  street: z
    .string()
    .min(1, "You must type a street")
    .max(40, "Too long")
    .regex(
      /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ][a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9 .,''-]*$/,
      "Invalid street name",
    ),
  streetNumber: z
    .string()
    .min(1, "You must type a street number")
    .max(10, "Too long"),
  rooms: createNumericStringSchema(
    "Type rooms",
    1,
    "Min 1 room",
    10,
    "Max 10 rooms",
  ),
  area: createNumericStringSchema(
    "Type area",
    1,
    "Min 1 m²",
    1000,
    "Max 1000 m²",
  ),
  buildYear: createNumericStringSchema(
    "Type year",
    1500,
    "Min 1500",
    2028,
    "Max 2028",
  ),
  condition: z.string().min(1, "You must select a condition"),
  hasParking: z.boolean(),
});

export const flatValuationFormOptionsSchema = baseValuationSchema.merge(
  z
    .object({
      buildingType: z.enum(["flat"]),
      floor: createNumericStringSchema("Type floor", 0, "Min 0", 20, "Max 20"),
      floorsInBuilding: createNumericStringSchema(
        "Type floors",
        1,
        "Min 1",
        20,
        "Max 20",
      ),
      hasElevator: z.boolean(),
      hasBalcony: z.boolean(),
      hasStorage: z.boolean(),
    })
    .refine(
      (data) => !data.floorsInBuilding || data.floor <= data.floorsInBuilding,
      {
        message: "Floor must be less than or equal to floors in building",
        path: ["floor"],
      },
    ),
);

export const houseValuationFormOptionsSchema = baseValuationSchema.merge(
  z.object({
    buildingType: z.enum(["house"]),
    plotArea: createNumericStringSchema(
      "Type plot area",
      1,
      "Min 1 m²",
      10000,
      "Max 10000 m²",
    ),
    numberOfFloors: createNumericStringSchema(
      "Type floors",
      1,
      "Min 1",
      4,
      "Max 4",
    ),
    hasGarage: z.boolean(),
    hasGarden: z.boolean(),
  }),
);

export const flatValuationFormOptions = formOptions({
  defaultValues: {
    ...baseDefaultValues,
    buildingType: "flat",
    floor: "",
    floorsInBuilding: "",
    hasElevator: false,
    hasBalcony: false,
    hasStorage: false,
  },
  validators: {
    onChange: flatValuationFormOptionsSchema,
  },
});

export const houseValuationFormOptions = formOptions({
  defaultValues: {
    ...baseDefaultValues,
    buildingType: "house",
    plotArea: "",
    numberOfFloors: "",
    hasGarage: false,
    hasGarden: false,
  },
  validators: {
    onChange: houseValuationFormOptionsSchema,
  },
});
