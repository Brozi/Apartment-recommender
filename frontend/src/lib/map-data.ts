export type MapOfferLocation = {
  id: number;
  lat: number;
  lng: number;
  price: number;
  location: string;
  rooms: number;
  area: number;
  pricePerM2: number;
};

export const MAP_OFFER_LOCATIONS: MapOfferLocation[] = [
  {
    id: 1,
    lat: 50.06143,
    lng: 19.93658,
    price: 1599000,
    location: "Jozefa Dietla 42/12 St.",
    rooms: 2,
    area: 51,
    pricePerM2: 21245,
  },
  {
    id: 2,
    lat: 50.06465,
    lng: 19.94498,
    price: 1225000,
    location: "Wesola 6 St.",
    rooms: 3,
    area: 58,
    pricePerM2: 21120,
  },
  {
    id: 3,
    lat: 50.04966,
    lng: 19.94412,
    price: 980000,
    location: "Krakowska 18 St.",
    rooms: 2,
    area: 45,
    pricePerM2: 21778,
  },
  {
    id: 4,
    lat: 50.0679,
    lng: 19.92164,
    price: 1895000,
    location: "Karmelicka 33 St.",
    rooms: 4,
    area: 76,
    pricePerM2: 24934,
  },
  {
    id: 5,
    lat: 50.03477,
    lng: 19.90564,
    price: 845000,
    location: "Tyniecka 12 St.",
    rooms: 2,
    area: 41,
    pricePerM2: 20610,
  },
];
