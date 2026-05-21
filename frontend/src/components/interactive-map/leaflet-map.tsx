import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import ApartmentIcon from "../icons/apartment-icon";
import MapOfferPreview from "../map-offer-preview/map-offer-preview";
import { MAP_OFFER_LOCATIONS } from "../../lib/map-data";
import styles from "./interactive-map.module.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const apartmentMarkerIcon = L.divIcon({
  className: styles.markerIcon,
  html: renderToStaticMarkup(
    <ApartmentIcon size={28} color="var(--clr-primary-100)" />,
  ),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

type SelectedOffer = (typeof MAP_OFFER_LOCATIONS)[number];

function MapClickHandler({ onClear }: { onClear: () => void }) {
  useMapEvent("click", () => {
    onClear();
  });

  return null;
}

function MarkerLayer({
  onSelect,
}: {
  onSelect: (offer: SelectedOffer) => void;
}) {
  return (
    <>
      {MAP_OFFER_LOCATIONS.map((offer) => (
        <Marker
          key={offer.id}
          position={[offer.lat, offer.lng]}
          icon={apartmentMarkerIcon}
          eventHandlers={{
            click: () => {
              onSelect(offer);
            },
          }}
        />
      ))}
    </>
  );
}

export default function LeafletMap() {
  const [selected, setSelected] = useState<SelectedOffer | null>(null);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        className={styles.leafletRoot}
        center={[50.06143, 19.93658]}
        zoom={13}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerLayer onSelect={setSelected} />
        <MapClickHandler onClear={() => setSelected(null)} />
      </MapContainer>

      {selected && (
        <MapOfferPreview
          className={styles.offerPreview}
          price={selected.price}
          location={selected.location}
          rooms={selected.rooms}
          area={selected.area}
          pricePerM2={selected.pricePerM2}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
