import { useQuery } from "@tanstack/react-query";
import type { ValuationInput, ValuationResult } from "#/lib/valuation-url-utils";

async function fetchValuation(input: ValuationInput): Promise<ValuationResult> {
  const response = await fetch("/v1/valuation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Valuation request failed: ${response.status}`);
  }

  return response.json() as Promise<ValuationResult>;
}

export function useValuation(input: ValuationInput | null) {
  return useQuery({
    queryKey: ["valuation", input],
    queryFn: () => fetchValuation(input!),
    enabled: input !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
