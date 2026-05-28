export const dashboardKeys = {
  kpis: (city: string, month: string) => ["kpis", city, month] as const,
  geography: (city: string, month: string) =>
    ["geography", city, month] as const,
  smartBuyer: (city: string, month: string) =>
    ["smartBuyer", city, month] as const,
};
