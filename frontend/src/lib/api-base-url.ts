const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL =
  (configuredApiBaseUrl
    ? configuredApiBaseUrl.replace(/\/$/, "")
    : undefined) ?? "https://apartment-recommender-1.onrender.com";
