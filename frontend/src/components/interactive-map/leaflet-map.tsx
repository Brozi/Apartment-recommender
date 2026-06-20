import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Tooltip,
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
  MapPoi,
  MapViewport,
} from "#/lib/types";
import { createPoiDivIcon } from "#/lib/utils";

type PoiCluster = {
  center: MapPoi;
  pois: MapPoi[];
};

function computePoiClusters(
  pois: MapPoi[],
  map: L.Map,
  radiusPx: number,
): PoiCluster[] {
  const visited = new Set<number>();
  const clusters: PoiCluster[] = [];
  for (const poi of pois) {
    if (visited.has(poi.id)) continue;
    const point = map.latLngToLayerPoint([poi.lat, poi.lng]);
    const cluster: PoiCluster = { center: poi, pois: [poi] };
    visited.add(poi.id);
    for (const other of pois) {
      if (visited.has(other.id)) continue;
      const otherPoint = map.latLngToLayerPoint([other.lat, other.lng]);
      if (point.distanceTo(otherPoint) <= radiusPx) {
        cluster.pois.push(other);
        visited.add(other.id);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function createPoiClusterCountIcon(count: number): L.DivIcon {
  const style = [
    "width: 1.5rem",
    "height: 1.5rem",
    "background-color: var(--clr-secondary-100)",
    "box-shadow: inset 0 0 0 1px var(--clr-primary-100)",
    "display: flex",
    "justify-content: center",
    "align-items: center",
    "aspect-ratio: 1 / 1",
    "transform: rotate(45deg)",
  ].join("; ");
  return L.divIcon({
    html: `<div style="${style}"><span class="${styles.markerText}" style="transform:rotate(-45deg);color:var(--clr-light-100);">${count}</span></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

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

function PoiMarkerLayer({
  pois,
  onPoiClick,
  onClusterClick,
}: {
  pois: MapPoi[];
  onPoiClick: (poi: MapPoi) => void;
  onClusterClick: (pois: MapPoi[]) => void;
}) {
  const map = useMap();
  const [clusters, setClusters] = useState<PoiCluster[]>(() =>
    computePoiClusters(pois, map, 40),
  );

  useMapEvents({
    moveend: () => setClusters(computePoiClusters(pois, map, 40)),
    zoomend: () => setClusters(computePoiClusters(pois, map, 40)),
  });

  useEffect(() => {
    setClusters(computePoiClusters(pois, map, 40));
  }, [pois, map]);

  return (
    <>
      {clusters.map((cluster, i) => (
        <Marker
          key={i}
          position={[cluster.center.lat, cluster.center.lng]}
          icon={
            cluster.pois.length === 1
              ? createPoiDivIcon(cluster.center.categoryGroup)
              : createPoiClusterCountIcon(cluster.pois.length)
          }
          eventHandlers={{
            click: () =>
              cluster.pois.length === 1
                ? onPoiClick(cluster.center)
                : onClusterClick(cluster.pois),
          }}
        />
      ))}
    </>
  );
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
            offer.rank
              ? `#${offer.rank} · ${Math.round(offer.totalPrice).toLocaleString("pl-PL")} zł`
              : `${Math.round(offer.totalPrice).toLocaleString("pl-PL")} zł`,
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
      {offersInPoints.map((offer) => {
        const hasScoreInfo =
          offer.offers && offer.offers.some((o) => (o.rank ?? 0) > 0);
        return (
          <Marker
            key={offer.firstOfferID}
            position={[offer.lat, offer.lng]}
            icon={createLabelIcon(
              offer.count.toLocaleString("pl-PL"),
              "cluster",
            )}
            eventHandlers={{
              click: () => {
                onSelect(offer);
              },
            }}
          >
            {hasScoreInfo && (
              <Tooltip direction="top" offset={[0, -8]}>
                <div style={{ lineHeight: 1.6, minWidth: "120px" }}>
                  <strong>Score order</strong>
                  {offer.offers!.map((o, i) => (
                    <div key={o.id}>
                      #{o.rank} offer {i + 1}
                    </div>
                  ))}
                </div>
              </Tooltip>
            )}
          </Marker>
        );
      })}
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
  const {
    selectOffer,
    selectOffersInPoint,
    selectPoiCluster,
    selectSinglePoi,
    clearSelection,
    mapData,
    poisData,
    mapBasePosition,
  } = useMapContext();
  const offerItems = mapData.offers.items;
  const offersInPointsItems = mapData.offersInPoint.items;
  const clusterItems = mapData.clusters.items;

  const [map, setMap] = useState<L.Map | null>(null);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        className={styles.leafletRoot}
        center={mapBasePosition}
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
        <PoiMarkerLayer
          pois={poisData.pois}
          onPoiClick={selectSinglePoi}
          onClusterClick={selectPoiCluster}
        />
        <MapClickHandler onClear={clearSelection} />
        <MapViewportWatcher onViewportChange={onViewportChange} />
        <ScrollZoomHandler />
      </MapContainer>
    </div>
  );
}
