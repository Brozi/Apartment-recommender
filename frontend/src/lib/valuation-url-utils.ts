import LZString from "lz-string";

export type ValuationInput = {
  district: string;
  rooms: string;
  area: number;
  buildYear: number;
  condition: string;
  hasParking: boolean;
  floor: number;
  floorsInBuilding: number;
  hasElevator: boolean;
  hasBalcony: boolean;
  market_type: string;
  offered_by: string;
  heating: string;
  lat: number;
  lon: number;
};

export type ValuationResult = {
  estimatedPrice: number;
};

export function encodeValuationToURL(input: ValuationInput): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(input));
}

export function decodeValuationFromURL(encoded: string): ValuationInput | null {
  const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
  if (!decompressed) return null;
  try {
    return JSON.parse(decompressed) as ValuationInput;
  } catch {
    return null;
  }
}
