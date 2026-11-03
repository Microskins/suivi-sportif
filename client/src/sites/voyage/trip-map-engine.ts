// Moteur cartographique du carnet de voyage, isole de React et charge a la
// demande: MapLibre (~1 Mo) ne doit peser que sur les pages qui affichent une
// carte, jamais sur le bundle principal des autres sites.
import {
  FullscreenControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./voyage-map-markers.css";
// Le worker est servi depuis notre propre origine: la CSP peut rester sur
// `worker-src 'self'` au lieu d'autoriser les workers `blob:`.
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { LngLat } from "./trip-types";
import { apiFileUrl } from "./voyage-api";
import type { GpxTrack } from "./gpx-track";
import type { MapStage } from "./trip-map-paths";
import { buildPaths, collection, lineFeature } from "./trip-map-paths";

setWorkerUrl(workerUrl);

// Plan 2D seul, a plat et nord en haut: les marqueurs d'etape restent
// colles a la carte et le trace se lit d'un coup d'oeil.
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const ACCENT = "#1c4ed8";

function boundsOf(route: LngLat[]) {
  return route.reduce(
    (bounds, point) => bounds.extend(point),
    new LngLatBounds(route[0], route[0]),
  );
}

type TripMapOptions = {
  container: HTMLElement;
  fullRoute: LngLat[];
  onError: () => void;
  // Bulle photo d'une randonnee: ouvre son etape et sa fiche.
  onSelectHike?: (stageIndex: number, trackId: string) => void;
  onSelectStage: (index: number) => void;
  // Appele pendant le rejeu, sans recentrer la camera.
  onStageReached: (index: number) => void;
  stages: MapStage[];
};

export function createTripMap({
  container,
  fullRoute,
  onError,
  onSelectHike,
  onSelectStage,
  onStageReached,
  stages,
}: TripMapOptions) {
  let animationFrame = 0;
  let paths = buildPaths(stages, []);
  let activities: GpxTrack[] = [];
  let tripBounds = boundsOf(fullRoute);

  const map = new MapLibreMap({
    attributionControl: { compact: true },
    bounds: tripBounds,
    container,
    dragRotate: false,
    fitBoundsOptions: { maxZoom: 9, padding: 48 },
    maxPitch: 0,
    pitchWithRotate: false,
    style: STYLE_URL,
    touchPitch: false,
  });
  // Pas de rotation au pincement: la carte reste nord en haut.
  map.touchZoomRotate.disableRotation();

  map.addControl(new NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new FullscreenControl(), "top-right");
  map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");

  let styleLoaded = false;
  map.on("load", () => {
    // Le cadrage initial ignore l'inclinaison: on recadre une fois le
    // conteneur mesure pour que toute la boucle tienne, meme sur mobile.
    overview(0);
  });
  map.on("error", () => {
    // Une tuile manquante ne doit pas masquer la carte; seul l'echec du style
    // initial (reseau coupe, CSP) bascule sur le repli textuel.
    if (!styleLoaded) {
      onError();
    }
  });

  function addTripLayers() {
    map.addSource("trip-route", {
      type: "geojson",
      data: paths.reconstructed,
    });
    map.addSource("trip-gps", { type: "geojson", data: paths.gps });
    map.addSource("trip-replay", {
      type: "geojson",
      data: collection([]),
    });
    for (const source of ["trip-route", "trip-gps", "trip-replay"]) {
      map.addLayer({
        id: `${source}-casing`,
        type: "line",
        source,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": source === "trip-gps" ? 8 : 7,
          "line-opacity": 0.85,
        },
      });
    }
    // Trace reconstitue en tirets, comme la ligne perforee du billet.
    map.addLayer({
      id: "trip-route",
      type: "line",
      source: "trip-route",
      layout: { "line-join": "round" },
      paint: {
        "line-color": ACCENT,
        "line-width": 4,
        "line-dasharray": [2, 1.6],
      },
    });
    // Trace GPS reelle en trait plein, coloree par altitude (facon Strava).
    map.addLayer({
      id: "trip-gps",
      type: "line",
      source: "trip-gps",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["get", "color"], "line-width": 5 },
    });
    map.addLayer({
      id: "trip-replay",
      type: "line",
      source: "trip-replay",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ACCENT, "line-width": 4.5 },
    });
  }

  map.on("style.load", () => {
    styleLoaded = true;
    addTripLayers();
  });

  // Marqueurs HTML: de vrais boutons, atteignables au clavier. Un lieu visite deux fois (retour a
  // Edimbourg) ne recoit qu'un seul marqueur.
  const seen = new Set<string>();
  const markers = stages.flatMap((stage, index) => {
    const key = stage.coordinates.join(",");
    if (seen.has(key)) {
      return [];
    }
    seen.add(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "voyage-map-marker";
    button.dataset.start = index === 0 ? "true" : "false";
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-label", `Étape ${index + 1} — ${stage.title}`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onSelectStage(index);
    });
    const marker = new Marker({ element: button, anchor: "center" })
      .setLngLat(stage.coordinates)
      .addTo(map);
    return [{ button, index, marker }];
  });

  // Repas: petits points orange (ou vignettes), sous les marqueurs d'etape. Un clic ouvre
  // l'etape du repas dans le panneau.
  const mealMarkers = stages.flatMap((stage, index) =>
    (stage.meals ?? []).map((meal) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "voyage-map-meal";
      button.title = meal.name;
      // Avec photo: une vignette ronde a la place du point.
      if (meal.photoUrl) {
        button.dataset.photo = "true";
        button.style.setProperty(
          "--meal-photo",
          `url("${encodeURI(apiFileUrl(meal.photoUrl))}")`,
        );
      }
      button.setAttribute(
        "aria-label",
        `Repas — ${meal.name}, étape ${index + 1} ${stage.title}`,
      );
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectStage(index);
      });
      return new Marker({ element: button, anchor: "center" })
        .setLngLat(meal.coordinates)
        .addTo(map);
    }),
  );
  // Les etapes restent au-dessus des repas (meme lieu, meme pixel).
  markers.forEach(({ marker }) => {
    marker.getElement().style.zIndex = "1";
  });

  // Bulles photo des randonnees, posees au depart de chaque trace qui a un
  // album (photo de reference). Creees quand les GPX arrivent.
  let hikeMarkers: Marker[] = [];
  function placeHikeBubbles(tracks: GpxTrack[]) {
    hikeMarkers.forEach((marker) => marker.remove());
    hikeMarkers = tracks.flatMap((track) => {
      const start = track.points[0]?.position;
      if (track.kind !== "randonnee" || !track.cover || !track.id || !start) {
        return [];
      }
      const trackId = track.id;
      const stage = stages[track.stageIndex];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "voyage-map-hike";
      button.title = track.name;
      button.style.setProperty(
        "--hike-photo",
        `url("${encodeURI(apiFileUrl(track.cover.url))}")`,
      );
      button.setAttribute(
        "aria-label",
        `Randonnée — ${track.name}, étape ${track.stageIndex + 1}${
          stage ? ` ${stage.title}` : ""
        } : voir l’album photo`,
      );
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectStage(track.stageIndex);
        onSelectHike?.(track.stageIndex, trackId);
      });
      // Pointe de la bulle sur le depart de la randonnee.
      return [
        new Marker({ element: button, anchor: "bottom" })
          .setLngLat(start)
          .addTo(map),
      ];
    });
  }

  function setSourceData(
    id: string,
    data: GeoJSON.FeatureCollection<GeoJSON.LineString>,
  ) {
    map.getSource<GeoJSONSource>(id)?.setData(data);
  }

  // Pendant le rejeu, seul le trace en cours de dessin reste visible.
  function showFinalRoute(visible: boolean) {
    setSourceData("trip-route", visible ? paths.reconstructed : collection([]));
    setSourceData("trip-gps", visible ? paths.gps : collection([]));
    if (visible) {
      setSourceData("trip-replay", collection([]));
    }
  }

  function stopReplay() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      showFinalRoute(true);
    }
  }

  function overview(duration?: number) {
    stopReplay();
    const padding = container.clientWidth < 640 ? 28 : 56;
    // Un carnet sans etapes se reduit a un point (l'aeroport): on montre le
    // pays autour plutot que de zoomer au maximum sur ce point.
    const sw = tripBounds.getSouthWest();
    const ne = tripBounds.getNorthEast();
    if (ne.lng - sw.lng < 0.05 && ne.lat - sw.lat < 0.05) {
      map.easeTo({ center: tripBounds.getCenter(), duration, zoom: 6.4 });
      return;
    }
    map.fitBounds(tripBounds, { duration, padding });
  }

  // Toute interaction manuelle reprend la main sur la camera.
  map.on("dragstart", stopReplay);
  map.on("wheel", stopReplay);

  return {
    destroy() {
      stopReplay();
      markers.forEach(({ marker }) => marker.remove());
      mealMarkers.forEach((marker) => marker.remove());
      hikeMarkers.forEach((marker) => marker.remove());
      map.remove();
    },

    focusStage(index: number) {
      stopReplay();
      markers.forEach(({ button, index: markerIndex }) => {
        const isActive =
          markerIndex === index ||
          stages[index].coordinates.join(",") ===
            stages[markerIndex].coordinates.join(",");
        button.setAttribute("aria-current", isActive ? "step" : "false");
      });
      // Une randonnee GPS est cadree en entier: un zoom fixe
      // sur le point d'etape la couperait ou la rendrait minuscule.
      const stageActivities = activities.filter(
        (track) => track.stageIndex === index,
      );
      if (stageActivities.length > 0) {
        map.fitBounds(
          boundsOf(
            stageActivities.flatMap((track) =>
              track.points.map((point) => point.position),
            ),
          ),
          {
            maxZoom: 14,
            padding: container.clientWidth < 640 ? 32 : 72,
          },
        );
        return;
      }
      map.flyTo({
        center: stages[index].coordinates,
        essential: true,
        zoom: 9.4,
      });
    },

    overview: () => overview(),

    replay(reducedMotion: boolean, onDone: () => void) {
      stopReplay();
      if (reducedMotion) {
        overview();
        onDone();
        return;
      }
      const durationMs = 26000;
      const startedAt = performance.now();
      let lastStage = -1;

      const denseRoute = paths.replay;
      showFinalRoute(false);

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        const head = Math.max(
          1,
          Math.floor(progress * (denseRoute.length - 1)),
        );
        setSourceData(
          "trip-replay",
          collection([lineFeature(denseRoute.slice(0, head + 1))]),
        );

        // La camera suit la tete du trace, toujours a plat et nord en haut.
        map.jumpTo({ center: denseRoute[head], zoom: 9.2 });

        const travelled = head / (denseRoute.length - 1);
        let reached = -1;
        paths.stageEnds.forEach((end, index) => {
          if (travelled >= end) {
            reached = index;
          }
        });
        if (reached !== lastStage && reached >= 0) {
          lastStage = reached;
          onStageReached(reached);
        }

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          animationFrame = 0;
          showFinalRoute(true);
          overview();
          onDone();
        }
      };
      animationFrame = requestAnimationFrame(step);
    },

    // Les GPX arrivent apres la creation de la carte: on remplace les
    // traces reconstituees concernees et on recadre sur l'ensemble.
    setTracks(tracks: GpxTrack[]) {
      stopReplay();
      paths = buildPaths(stages, tracks);
      activities = tracks.filter((track) => track.kind === "randonnee");
      tripBounds = boundsOf([
        ...fullRoute,
        ...tracks.flatMap((track) => track.points.map((p) => p.position)),
      ]);
      showFinalRoute(true);
      placeHikeBubbles(tracks);
    },

    stopReplay,
  };
}

export type TripMapHandle = ReturnType<typeof createTripMap>;
