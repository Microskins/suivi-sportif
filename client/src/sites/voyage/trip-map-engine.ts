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
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// Le worker est servi depuis notre propre origine: la CSP peut rester sur
// `worker-src 'self'` au lieu d'autoriser les workers `blob:`.
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { LngLat } from "./ecosse-2026-data";
import type { GpxTrack } from "./gpx-track";
import type { MapStage } from "./trip-map-paths";
import {
  bearingBetween,
  buildPaths,
  collection,
  lineFeature,
} from "./trip-map-paths";

setWorkerUrl(workerUrl);

export type MapModelId = "plan" | "relief" | "satellite";

type MapModel = {
  bearing: number;
  pitch: number;
  style: string | StyleSpecification;
  terrain: boolean;
};

const INK = "#0f1b2b";
const ACCENT = "#1c4ed8";

const TERRAIN_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const TERRAIN_ATTRIBUTION =
  '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Mapzen Terrain Tiles</a>';

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 18,
      attribution: "Imagerie © Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "satellite", type: "raster", source: "satellite" }],
};

export const mapModels: Record<MapModelId, MapModel> = {
  plan: {
    bearing: 0,
    pitch: 0,
    style: "https://tiles.openfreemap.org/styles/positron",
    terrain: false,
  },
  relief: {
    bearing: -12,
    pitch: 58,
    style: "https://tiles.openfreemap.org/styles/liberty",
    terrain: true,
  },
  satellite: {
    bearing: -12,
    pitch: 62,
    style: satelliteStyle,
    terrain: true,
  },
};

function boundsOf(route: LngLat[]) {
  return route.reduce(
    (bounds, point) => bounds.extend(point),
    new LngLatBounds(route[0], route[0]),
  );
}

type TripMapOptions = {
  container: HTMLElement;
  fullRoute: LngLat[];
  model: MapModelId;
  onError: () => void;
  onSelectStage: (index: number) => void;
  // Appele pendant le rejeu, sans recentrer la camera.
  onStageReached: (index: number) => void;
  stages: MapStage[];
};

export function createTripMap({
  container,
  fullRoute,
  model: initialModel,
  onError,
  onSelectStage,
  onStageReached,
  stages,
}: TripMapOptions) {
  let model = initialModel;
  let animationFrame = 0;
  let paths = buildPaths(stages, []);
  let activities: GpxTrack[] = [];
  let tripBounds = boundsOf(fullRoute);

  const map = new MapLibreMap({
    attributionControl: { compact: true },
    bearing: mapModels[model].bearing,
    bounds: tripBounds,
    container,
    fitBoundsOptions: { padding: 48 },
    maxPitch: 75,
    pitch: mapModels[model].pitch,
    style: mapModels[model].style,
  });

  map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
  map.addControl(new FullscreenControl(), "top-right");
  map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");

  let hasLoaded = false;
  map.on("load", () => {
    hasLoaded = true;
    // Le cadrage initial ignore l'inclinaison: on recadre une fois le
    // conteneur mesure pour que toute la boucle tienne, meme sur mobile.
    overview(0);
  });
  map.on("error", () => {
    // Une tuile manquante ne doit pas masquer la carte; seul l'echec du style
    // initial (reseau coupe, CSP) bascule sur le repli textuel.
    if (!hasLoaded) {
      onError();
    }
  });

  function addTripLayers() {
    const settings = mapModels[model];
    if (settings.terrain) {
      map.addSource("terrain-dem", {
        type: "raster-dem",
        tiles: [TERRAIN_TILES],
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 14,
        attribution: TERRAIN_ATTRIBUTION,
      });
      // Source distincte pour l'ombrage: MapLibre recommande de ne pas
      // partager la meme source raster-dem entre terrain et hillshade.
      map.addSource("hillshade-dem", {
        type: "raster-dem",
        tiles: [TERRAIN_TILES],
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 14,
      });
      map.addLayer({
        id: "trip-hillshade",
        type: "hillshade",
        source: "hillshade-dem",
        paint: {
          "hillshade-exaggeration": model === "satellite" ? 0.15 : 0.45,
          "hillshade-shadow-color": INK,
        },
      });
      map.setTerrain({ source: "terrain-dem", exaggeration: 1.6 });
      map.setSky({
        "sky-color": "#9bb5ff",
        "horizon-color": "#eef2f6",
        "fog-color": "#f4f6f8",
        "sky-horizon-blend": 0.6,
        "horizon-fog-blend": 0.5,
        "fog-ground-blend": 0.4,
      });
    }

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

  map.on("style.load", addTripLayers);

  // Marqueurs HTML: de vrais boutons, atteignables au clavier et persistants
  // d'un changement de style a l'autre. Un lieu visite deux fois (retour a
  // Edimbourg) ne recoit qu'un seul marqueur.
  const seen = new Set<string>();
  const markers = stages.flatMap((stage, index) => {
    const key = stage.position.join(",");
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
      .setLngLat(stage.position)
      .addTo(map);
    return [{ button, index, marker }];
  });

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
    const settings = mapModels[model];
    const padding = container.clientWidth < 640 ? 28 : 56;
    map.fitBounds(tripBounds, {
      bearing: settings.bearing,
      duration,
      padding,
      pitch: settings.pitch,
    });
  }

  // Toute interaction manuelle reprend la main sur la camera.
  map.on("dragstart", stopReplay);
  map.on("wheel", stopReplay);

  return {
    destroy() {
      stopReplay();
      markers.forEach(({ marker }) => marker.remove());
      map.remove();
    },

    focusStage(index: number) {
      stopReplay();
      markers.forEach(({ button, index: markerIndex }) => {
        const isActive =
          markerIndex === index ||
          stages[index].position.join(",") ===
            stages[markerIndex].position.join(",");
        button.setAttribute("aria-current", isActive ? "step" : "false");
      });
      const settings = mapModels[model];
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
            bearing: settings.bearing,
            maxZoom: 14,
            padding: container.clientWidth < 640 ? 32 : 72,
            pitch: settings.pitch,
          },
        );
        return;
      }
      map.flyTo({
        bearing: settings.bearing,
        center: stages[index].position,
        essential: true,
        pitch: settings.pitch,
        zoom: settings.terrain ? 10.2 : 9.4,
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
      const settings = mapModels[model];
      const pitch = Math.max(settings.pitch, 50);

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

        const lookAhead =
          denseRoute[Math.min(denseRoute.length - 1, head + 12)];
        const current = denseRoute[head];
        map.jumpTo({
          bearing: bearingBetween(current, lookAhead),
          center: current,
          pitch,
          zoom: 9.2,
        });

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

    setModel(next: MapModelId) {
      if (next === model) {
        return;
      }
      stopReplay();
      model = next;
      const settings = mapModels[next];
      // Le terrain de l'ancien style reference une source qui va disparaitre.
      map.setTerrain(null);
      map.setStyle(settings.style);
      map.easeTo({
        bearing: settings.bearing,
        pitch: settings.pitch,
        duration: 900,
      });
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
    },

    stopReplay,
  };
}

export type TripMapHandle = ReturnType<typeof createTripMap>;
