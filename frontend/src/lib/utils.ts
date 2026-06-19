import * as z from "zod";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import { createElement } from "react";
import type { PoiCategoryGroup, SvgIcon } from "./types";
import ParcelIcon from "#/components/icons/parcel-icon";
import ShoppingBasketIcon from "#/components/icons/shopping-basket-icon";
import BusIcon from "#/components/icons/bus-icon";
import TramIcon from "#/components/icons/tram-icon";
import BabyStrollerIcon from "#/components/icons/baby-stoller-icon";
import BackpackIcon from "#/components/icons/backpack-icon";
import BrainIcon from "#/components/icons/brain-icon";
import StudentIcon from "#/components/icons/student-icon";
import CarIcon from "#/components/icons/car-icon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(number)
    .replace(/\u00a0/g, " ");
};

export const replaceUnderscores = (value: string): string => {
  return value.replace(/_/g, " ");
};

export const roundToTwo = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const stringToNumberOrNull = (value: string): number | null => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const createNumericStringSchema = (
  requiredMsg: string,
  minVal: number,
  minMsg: string,
  maxVal: number,
  maxMsg: string,
) => {
  return z
    .string()
    .min(1, requiredMsg)
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ message: "You must type a number" })
        .min(minVal, minMsg)
        .max(maxVal, maxMsg),
    );
};

export const createOptionalNumericStringSchema = (
  minVal: number,
  minMsg: string,
  maxVal: number,
  maxMsg: string,
) => {
  return z.string().superRefine((val, ctx) => {
    if (val === "") return;
    const num = Number(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must type a number",
      });
      return;
    }
    if (num < minVal) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: minMsg });
    }
    if (num > maxVal) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: maxMsg });
    }
  });
};

export function createPoiDivIcon(
  category: PoiCategoryGroup,
  size: number = 16,
): L.DivIcon {
  const IconComponent = iconByPoiCategory(category);
  const iconHtml = renderToString(createElement(IconComponent, { size }));
  const style = [
    "width: 1.5rem",
    "height: 1.5rem",
    "background-color: var(--clr-secondary-100)",
    "box-shadow: inset 0 0 0 1px var(--clr-primary-100)",
    "display: flex",
    "justify-content: center",
    "align-items: center",
    "aspect-ratio: 1 / 1",
    "transform: rotate(45deg)",
  ].join("; ");
  const html = `<div style="${style}">${iconHtml}</div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function iconByPoiCategory(category: PoiCategoryGroup): SvgIcon {
  switch (category) {
    case "parcel_service":
      return ParcelIcon as SvgIcon;
    case "grocery_retail":
      return ShoppingBasketIcon as SvgIcon;
    case "bus_stop":
      return BusIcon as SvgIcon;
    case "tram_stop":
      return TramIcon as SvgIcon;
    case "kindergarten":
      return BabyStrollerIcon as SvgIcon;
    case "school":
      return BackpackIcon as SvgIcon;
    case "specialized_school":
      return BrainIcon as SvgIcon;
    case "university":
      return StudentIcon as SvgIcon;
    case "driving_school":
      return CarIcon as SvgIcon;
  }
}

export function defaultDescriptionByCategory(
  category: PoiCategoryGroup,
): string {
  switch (category) {
    case "parcel_service":
      return "Parcel locker or post office";
    case "grocery_retail":
      return "Grocery store or supermarket";
    case "bus_stop":
      return "Bus stop";
    case "tram_stop":
      return "Tram stop";
    case "kindergarten":
      return "Kindergarten";
    case "school":
      return "School";
    case "specialized_school":
      return "Specialized school (e.g. language, music, art)";
    case "university":
      return "University or college";
    case "driving_school":
      return "Driving school";
  }
}
