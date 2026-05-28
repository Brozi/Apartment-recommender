import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import ApartmentIcon from "#/components/icons/apartment-icon";
import styles from "#/components/interactive-map/interactive-map.module.css";
import { useMapContext } from "#/hooks/use-map-context";
import type { MapOffersResponse } from "#/lib/types";

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

function MapClickHandler({ onClear }: { onClear: () => void }) {
  useMapEvent("click", () => {
    onClear();
  });

  return null;
}

function MarkerLayer({
  onSelect,
  mapOffers,
}: {
  onSelect: (offerId: string) => void;
  mapOffers: MapOffersResponse[];
}) {
  return (
    <>
      {mapOffers.map((offer) => (
        <Marker
          key={offer.id}
          position={[offer.lat, offer.lng]}
          icon={apartmentMarkerIcon}
          eventHandlers={{
            click: () => {
              onSelect(offer.id);
            },
          }}
        />
      ))}
    </>
  );
}

export default function LeafletMap() {
  const { selectOffer, clearSelection, mapOffers } = useMapContext();

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
        <MarkerLayer onSelect={selectOffer} mapOffers={mapOffers} />
        <MapClickHandler onClear={clearSelection} />
      </MapContainer>
    </div>
  );
}
