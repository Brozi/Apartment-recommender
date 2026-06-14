import * as z from "zod";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
