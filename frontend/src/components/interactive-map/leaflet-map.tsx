import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import styles from "#/components/interactive-map/interactive-map.module.css";
import { useMapContext } from "#/hooks/use-map-context";
import type {
  MapClusterItem,
  MapOfferItem,
  MapOffersInPoint,
  MapViewport,
} from "#/lib/types";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function createLabelIcon(label: string, variant: "offer" | "cluster") {
  const bubbleClass =
    variant === "offer" ? styles.markerOffer : styles.markerCluster;

  return L.divIcon({
    className: styles.markerIcon,
    html: `<div class="${styles.markerBubble} ${bubbleClass}"><span class="${styles.markerText}">${label}</span></div>`,
    iconSize: [0, 0],
  });
}

function MapClickHandler({ onClear }: { onClear: () => void }) {
  useMapEvent("click", () => {
    onClear();
  });

  return null;
}

function OfferMarkerLayer({
  onSelect,
  offers,
}: {
  onSelect: (offerId: string) => void;
  offers: MapOfferItem[];
}) {
  return (
    <>
      {offers.map((offer) => (
        <Marker
          key={offer.id}
          position={[offer.lat, offer.lng]}
          icon={createLabelIcon(
            `${Math.round(offer.totalPrice).toLocaleString("pl-PL")} zl`,
            "offer",
          )}
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

function OffersInPointMarkerLayer({
  offersInPoints,
  onSelect,
}: {
  offersInPoints: MapOffersInPoint[];
  onSelect: (selection: MapOffersInPoint) => void;
}) {
  return (
    <>
      {offersInPoints.map((offer) => (
        <Marker
          key={offer.firstOfferID}
          position={[offer.lat, offer.lng]}
          icon={createLabelIcon(offer.count.toLocaleString("pl-PL"), "cluster")}
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

function ClusterMarkerLayer({ clusters }: { clusters: MapClusterItem[] }) {
  const map = useMap();

  const handleClusterClick = (cluster: MapClusterItem) => {
    const maxZoom = map.getMaxZoom() || 18;
    const targetZoom = Math.min(map.getZoom() + 2, maxZoom);
    map.flyTo([cluster.lat, cluster.lng], targetZoom, { duration: 0.5 });
  };

  return (
    <>
      {clusters.map((cluster, index) => (
        <Marker
          key={`${cluster.lat}-${cluster.lng}-${index}`}
          position={[cluster.lat, cluster.lng]}
          icon={createLabelIcon(
            cluster.count.toLocaleString("pl-PL"),
            "cluster",
          )}
          eventHandlers={{
            click: () => {
              handleClusterClick(cluster);
            },
          }}
        />
      ))}
    </>
  );
}

function MapViewportWatcher({
  onViewportChange,
}: {
  onViewportChange: (payload: MapViewport) => void;
}) {
  const map = useMap();

  const emitViewport = () => {
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    onViewportChange({
      zoom: map.getZoom(),
      north: ne.lat,
      east: ne.lng,
      south: sw.lat,
      west: sw.lng,
    });
  };

  useEffect(() => {
    emitViewport();
  }, [map, onViewportChange]);

  useMapEvents({
    moveend: emitViewport,
    zoomend: emitViewport,
  });

  return null;
}

function ScrollZoomHandler() {
  const map = useMap();
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const enable = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        map.scrollWheelZoom.enable();
      }
    };

    const disable = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        map.scrollWheelZoom.disable();
      }
    };

    const onBlur = () => {
      map.scrollWheelZoom.disable();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!event.ctrlKey) {
        setShowHint(true);
        if (hintTimeoutRef.current) {
          window.clearTimeout(hintTimeoutRef.current);
        }
        hintTimeoutRef.current = window.setTimeout(() => {
          setShowHint(false);
        }, 1200);
      }
    };

    map.scrollWheelZoom.disable();
    window.addEventListener("keydown", enable);
    window.addEventListener("keyup", disable);
    window.addEventListener("blur", onBlur);
    map.getContainer().addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", enable);
      window.removeEventListener("keyup", disable);
      window.removeEventListener("blur", onBlur);
      map.getContainer().removeEventListener("wheel", onWheel);
      map.scrollWheelZoom.disable();
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [map]);

  return (
    <div
      className={`${styles.scrollHintOverlay} ${
        showHint ? styles.scrollHintOverlayVisible : ""
      }`}
    >
      <p
        className="font-h2"
        style={{
          color: "var(--clr-light-100)",
          lineHeight: 1.6,
          textShadow: "var(--shadow-text)",
        }}
      >
        Hold ctrl and scroll to zoom the map
      </p>
    </div>
  );
}

export default function LeafletMap({
  onViewportChange,
}: {
  onViewportChange: (viewport: MapViewport) => void;
}) {
  const { selectOffer, selectOffersInPoint, clearSelection, mapData } =
    useMapContext();
  const offerItems = mapData.offers.items;
  const offersInPointsItems = mapData.offersInPoint.items;
  const clusterItems = mapData.clusters.items;

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        className={styles.leafletRoot}
        center={[50.06143, 19.93658]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ClusterMarkerLayer clusters={clusterItems} />
        <OffersInPointMarkerLayer
          offersInPoints={offersInPointsItems}
          onSelect={selectOffersInPoint}
        />
        <OfferMarkerLayer onSelect={selectOffer} offers={offerItems} />
        <MapClickHandler onClear={clearSelection} />
        <MapViewportWatcher onViewportChange={onViewportChange} />
        <ScrollZoomHandler />
      </MapContainer>
    </div>
  );
}
