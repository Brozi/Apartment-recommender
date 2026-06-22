import { useQuery } from "@tanstack/react-query";

type CoordinatesResult = {
  lat: string;
  lon: string;
} | null;

type NominatimPlace = {
  lat: string;
  lon: string;
};

export const fetchCoordinates = async (
  street: string,
  streetNumber: string,
  district: string,
): Promise<CoordinatesResult> => {
  const params = new URLSearchParams({
    city: "Kraków",
    street: `${street} ${streetNumber}`,
    suburb: district,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const data: NominatimPlace[] = await response.json();

  if (data.length === 0) {
    return null;
  }

  return { lat: data[0].lat, lon: data[0].lon };
};

type UseCoordinatesParams = {
  street: string;
  streetNumber: string;
  district: string;
  enabled?: boolean;
};

export function useCoordinates({
  street,
  streetNumber,
  district,
  enabled = false,
}: UseCoordinatesParams) {
  return useQuery({
    queryKey: ["coordinates", street, streetNumber, district],
    queryFn: () => fetchCoordinates(street, streetNumber, district),
    enabled:
      enabled &&
      street.length > 0 &&
      streetNumber.length > 0 &&
      district.length > 0,
    retry: 1,
    staleTime: 60 * 60 * 1000,
  });
}
