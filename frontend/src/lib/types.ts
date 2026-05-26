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

export type MapOffersResponse = {
  id: string;
  lat: number;
  lng: number;
  price: number;
};

export type OfferDetailsResponse = {
  id: string;
  lat: number;
  lng: number;
  price: number;
  city: string;
  district: string;
  street: string;
  rooms: number;
  area: number;
  pricePerM2: number;
  photoUrls: string[];
  link: string;
};
