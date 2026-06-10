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

export type DashboardKPIsResponse = {
  info_boxes: DashboardInfoBox[];
  build_year: { range: string; count: number }[];
  rooms: { rooms: string; count: number }[];
  finishing_state: { state: string; count: number }[];
  expensive_districts: { district: string; average: number; median: number }[];
  cheapest_districts: { district: string; average: number; median: number }[];
  new_offers_timeline: { year: number; date: string; offers: number }[];
};

export type MapViewport = {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
};

export type MapOfferItem = {
  type: "offer";
  id: string;
  totalPrice: number;
  lat: number;
  lng: number;
};

export type MapOffersInPoint = {
  type: "offersInPoint";
  lat: number;
  lng: number;
  count: number;
  firstOfferID: string;
};

export type MapClusterItem = {
  type: "cluster";
  lat: number;
  lng: number;
  count: number;
};

export type MapOffersResponse = {
  offers: {
    items: MapOfferItem[];
  };
  offersInPoint: {
    items: MapOffersInPoint[];
  };
  clusters: {
    items: MapClusterItem[];
  };
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

type limitRange = {
  lower: number;
  upper: number;
};

export type FilterLimitsResponse = {
  price: limitRange;
  pricePerMeter: limitRange;
  area: limitRange;
  buildYear: limitRange;
};
