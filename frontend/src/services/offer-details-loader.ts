import type { OfferDetailsResponse } from "../lib/types";

export const fetchOfferDetails = async ({
  id,
}: {
  id: string;
}): Promise<OfferDetailsResponse> => {
  const response = await fetch(`http://localhost:4000/v1/offer/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load offer details");
  }

  return response.json() as Promise<OfferDetailsResponse>;
};

export const offerDetailsLoader = async ({ id }: { id: string }) => {
  return fetchOfferDetails({ id });
};
