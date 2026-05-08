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
