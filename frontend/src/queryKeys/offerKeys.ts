export const offerKeys = {
  all: ["offers"] as const,
  details: () => [...offerKeys.all, "details"] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
};
