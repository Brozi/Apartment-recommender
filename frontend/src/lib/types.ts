export type ChartData = Record<string, string | number>;

export type BarConfig = {
  dataKey: string;
  color: string;
};

export type LineConfig = {
  dataKey: string;
  color: string;
};

export type DashboardInfoBox = {
  id: number;
  title: string;
  firstLineTitle: string;
  firstLineValue: number;
  secondLineTitle: string;
  secondLineValue: number;
  unit: string;
};

export type DashboardKpisResponse = {
  info_boxes: DashboardInfoBox[];
  build_year: { range: string; count: number }[];
  rooms: { rooms: string; count: number }[];
  finishing_state: { state: string; count: number }[];
  expensive_districts: { district: string; average: number; median: number }[];
  cheapest_districts: { district: string; average: number; median: number }[];
  new_offers_timeline: { year: number; date: string; offers: number }[];
};
