export const filterLimitsKeys = {
  limits: (city: string) => ["filterLimits", city] as const,
};
