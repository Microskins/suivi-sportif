// Globe d'accueil du site Voyage: la Terre en 3D avec l'arc de chaque vol.
// Cliquer un arc (ou sa destination) plonge vers le pays puis ouvre le
// carnet. Charge a la demande, comme la carte des carnets.
import {
  FullscreenControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type ExpressionSpecification,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./voyage-map-markers.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { LngLat, TripSummary } from "./trip-types";
import { tripHref } from "./trip-types";
import { greatCircle, headingBetween } from "./great-circle";

setWorkerUrl(workerUrl);

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const ACCENT = "#1c4ed8";
const AMBER = "#e08a1e";
const INK = "#0f1b2b";
// Un aller simple prend ~5 s: assez lent pour suivre l'avion des yeux.
const FLIGHT_MS = 5200;

const PLANE_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';

// Voiture vue de dessus, capot vers le haut comme l'avion: la rotation par
// cap s'applique de la meme facon.
const CAR_SVG =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8.5 2.5h7a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19V5a2.5 2.5 0 0 1 2.5-2.5z"/><path fill="#ffffff" d="M8.6 7.2h6.8l-1 2.6H9.6zM9.4 15.6h5.2l.9 2.4H8.5z"/></svg>';

type GlobeOptions = {
  container: HTMLElement;
  onError: () => void;
  onHoverTrip: (tripId: string | null) => void;
  reducedMotion: boolean;
  trips: TripSummary[];
};

export function createVoyageGlobe({
  container,
  onError,
  onHoverTrip,
  reducedMotion,
  trips,
}: GlobeOptions) {
  const flights = trips.flatMap((trip) =>
    trip.flights.map((flight) => ({
      arc: greatCircle(flight.from.coordinates, flight.to.coordinates),
      flight,
      trip,
    })),
  );
  // Sans vol (catalogue vide), le globe se cadre sur l'Europe.
  const allPoints: LngLat[] = flights.length
    ? flights.flatMap(({ arc }) => arc)
    : [
        [-10, 36],
        [25, 60],
      ];
  const bounds = allPoints.reduce(
    (box, point) => box.extend(point),
    new LngLatBounds(allPoints[0], allPoints[0]),
  );

  const map = new MapLibreMap({
    attributionControl: { compact: true },
    center: bounds.getCenter(),
    container,
    maxZoom: 7,
    style: STYLE_URL,
    zoom: 1.6,
  });
  map.addControl(new NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new FullscreenControl(), "top-right");

  let styleLoaded = false;
  // Seul l'echec du style (reseau coupe, CSP) bascule sur le repli: une
  // tuile manquante ne doit pas effacer tout le globe.
  map.on("error", () => {
    if (!styleLoaded) onError();
  });

  map.on("style.load", () => {
    styleLoaded = true;
    map.setProjection({ type: "globe" });
    // Halo d'atmosphere autour du globe, efface en zoomant sur un pays.
    map.setSky({
      "atmosphere-blend": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        4,
        0.6,
        6,
        0,
      ],
      "sky-color": "#dce6f5",
    });

    map.addSource("flights", {
      type: "geojson",
      promoteId: "tripId",
      data: {
        type: "FeatureCollection",
        features: flights.map(({ arc, flight, trip }) => ({
          type: "Feature",
          properties: {
            mode: flight.mode,
            status: trip.status,
            tripId: trip.id,
          },
          geometry: { type: "LineString", coordinates: arc },
        })),
      },
    });
    const isHover: ExpressionSpecification = [
      "boolean",
      ["feature-state", "hover"],
      false,
    ];
    map.addLayer({
      id: "flights-casing",
      type: "line",
      source: "flights",
      layout: { "line-cap": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-width": ["case", isHover, 9, 6],
      },
    });
    const statusColor: ExpressionSpecification = [
      "match",
      ["get", "status"],
      "a-venir",
      AMBER,
      ACCENT,
    ];
    // Avion: trait plein. Voiture: tirets, comme une route sur une carte.
    map.addLayer({
      id: "flights",
      type: "line",
      source: "flights",
      filter: ["!=", ["get", "mode"], "voiture"],
      layout: { "line-cap": "round" },
      paint: {
        "line-color": statusColor,
        "line-width": ["case", isHover, 5, 3],
      },
    });
    map.addLayer({
      id: "drives",
      type: "line",
      source: "flights",
      filter: ["==", ["get", "mode"], "voiture"],
      paint: {
        "line-color": statusColor,
        "line-dasharray": [1.4, 1.1],
        "line-width": ["case", isHover, 5, 3.5],
      },
    });
    // Zone de clic large et invisible: un arc de 3 px est dur a viser.
    map.addLayer({
      id: "flights-hit",
      type: "line",
      source: "flights",
      paint: { "line-color": "#000000", "line-opacity": 0, "line-width": 22 },
    });
  });

  map.on("load", () => {
    map.fitBounds(bounds, {
      duration: reducedMotion ? 0 : 2200,
      // Zoom plafonne: on doit encore voir la courbure du globe, meme
      // quand tous les vols tiennent dans l'Europe.
      maxZoom: container.clientWidth < 640 ? 1.6 : 2.8,
      // Sur grand ecran le titre occupe la gauche: le globe se decale a droite.
      padding:
        container.clientWidth >= 1024
          ? {
              bottom: 90,
              left: container.clientWidth * 0.42,
              right: 90,
              top: 90,
            }
          : 40,
    });
  });

  let hovered: string | null = null;
  function setHover(tripId: string | null) {
    if (hovered === tripId) return;
    if (hovered)
      map.setFeatureState({ source: "flights", id: hovered }, { hover: false });
    hovered = tripId;
    if (tripId)
      map.setFeatureState({ source: "flights", id: tripId }, { hover: true });
    destinationMarkers.forEach(({ button, trip }) =>
      button.toggleAttribute("data-active", trip.id === tripId),
    );
  }

  map.on("mousemove", "flights-hit", (event: MapLayerMouseEvent) => {
    const tripId = event.features?.[0]?.properties?.tripId ?? null;
    map.getCanvas().style.cursor = "pointer";
    setHover(tripId);
    onHoverTrip(tripId);
  });
  map.on("mouseleave", "flights-hit", () => {
    map.getCanvas().style.cursor = "";
    setHover(null);
    onHoverTrip(null);
  });
  map.on("click", "flights-hit", (event: MapLayerMouseEvent) => {
    const tripId = event.features?.[0]?.properties?.tripId;
    const trip = trips.find((candidate) => candidate.id === tripId);
    if (trip) openTrip(trip);
  });

  // Destinations: de vrais liens, atteignables au clavier, qui ouvrent le
  // carnet comme un clic sur l'arc.
  const destinationMarkers = flights.map(({ flight, trip }) => {
    const button = document.createElement("a");
    button.href = tripHref(trip.slug);
    button.className = "voyage-globe-destination";
    button.dataset.status = trip.status;
    button.textContent = flight.to.code;
    button.setAttribute("aria-label", `Ouvrir le carnet ${trip.country}`);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openTrip(trip);
    });
    button.addEventListener("mouseenter", () => onHoverTrip(trip.id));
    button.addEventListener("mouseleave", () => onHoverTrip(null));
    const marker = new Marker({ element: button, opacityWhenCovered: "0" })
      .setLngLat(flight.to.coordinates)
      .addTo(map);
    return { button, marker, trip };
  });

  const origins = new Map<string, LngLat>();
  flights.forEach(({ flight }) =>
    origins.set(flight.from.code, flight.from.coordinates),
  );
  const originMarkers = [...origins].map(([code, position]) => {
    const dot = document.createElement("span");
    dot.className = "voyage-globe-origin";
    dot.title = code;
    dot.setAttribute("aria-hidden", "true");
    return new Marker({ element: dot, opacityWhenCovered: "0" })
      .setLngLat(position)
      .addTo(map);
  });

  // Un avion (ou une voiture) par trajet, qui parcourt son arc en boucle;
  // immobile a mi-parcours si l'utilisateur prefere limiter les animations.
  const planes = flights.map(({ arc, flight, trip }) => {
    const element = document.createElement("span");
    element.className = "voyage-globe-plane";
    element.style.color = trip.status === "a-venir" ? AMBER : INK;
    element.innerHTML = flight.mode === "voiture" ? CAR_SVG : PLANE_SVG;
    const marker = new Marker({
      element,
      opacityWhenCovered: "0",
      rotationAlignment: "map",
    })
      // Position initiale obligatoire avant addTo: MapLibre la lit aussitot.
      .setLngLat(arc[0])
      .addTo(map);
    return { arc, marker };
  });

  function placePlanes(progress: number) {
    planes.forEach(({ arc, marker }, index) => {
      // Decalage par vol: les avions ne decollent pas tous ensemble.
      // Modulo ramene dans [0, 1[: le premier horodatage d'animation peut
      // preceder `startedAt` et rendre la progression negative.
      const local = (((progress + index * 0.37) % 1) + 1) % 1;
      const position = Math.min(
        arc.length - 2,
        Math.floor(local * (arc.length - 1)),
      );
      marker
        .setLngLat(arc[position])
        .setRotation(headingBetween(arc[position], arc[position + 1]));
    });
  }

  let frame = 0;
  let isVisible = true;
  const visibility = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  });
  visibility.observe(container);

  if (reducedMotion) {
    placePlanes(0.5);
  } else {
    const startedAt = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (isVisible) placePlanes(((now - startedAt) % FLIGHT_MS) / FLIGHT_MS);
    };
    frame = requestAnimationFrame(tick);
  }

  // Plongee vers le pays, puis ouverture du carnet et de sa carte detaillee.
  function openTrip(trip: TripSummary) {
    const destination = trip.flights[0].to.coordinates;
    const href = tripHref(trip.slug);
    if (reducedMotion) {
      window.location.assign(href);
      return;
    }
    map.once("moveend", () => window.location.assign(href));
    map.flyTo({
      center: destination,
      duration: 1600,
      essential: true,
      zoom: 5.2,
    });
  }

  return {
    destroy() {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      [...destinationMarkers.map(({ marker }) => marker), ...originMarkers]
        .concat(planes.map(({ marker }) => marker))
        .forEach((marker) => marker.remove());
      map.remove();
    },
    highlight: setHover,
    openTrip,
  };
}

export type VoyageGlobeHandle = ReturnType<typeof createVoyageGlobe>;
