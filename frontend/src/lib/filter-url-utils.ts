import LZString from "lz-string";
import type {
  Step1FormValues,
  Step2FormValues,
} from "#/feature/forms/map-form-options";

export type FilterFormValues = {
  step1: Step1FormValues;
  step2: Step2FormValues;
};

export type CleanedFilterFormValues = {
  step1?: Partial<Step1FormValues>;
  step2?: Partial<Step2FormValues>;
};

function cleanValue(value: unknown): unknown {
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    const cleaned = value.map(cleanValue).filter((v) => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = cleanValue(v);
      if (cleaned !== undefined) {
        result[k] = cleaned;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  if (value === "" || value === 0) return undefined;

  return value;
}

export function cleanFilters(
  rawValues: FilterFormValues,
): CleanedFilterFormValues | undefined {
  return cleanValue(rawValues) as CleanedFilterFormValues | undefined;
}

export function encodeFiltersToURL(
  cleanedValues: CleanedFilterFormValues,
): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(cleanedValues));
}

export function decodeFiltersFromURL(
  encodedString: string,
): CleanedFilterFormValues | null {
  const decompressed =
    LZString.decompressFromEncodedURIComponent(encodedString);
  if (!decompressed) return null;
  try {
    return JSON.parse(decompressed) as CleanedFilterFormValues;
  } catch {
    return null;
  }
}
