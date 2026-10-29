// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { TripStage } from "./trip-types";
import {
  elevationProfile,
  elevationSegments,
  formatDistance,
  formatDuration,
  parseGpx,
  stageDistance,
  trackStats,
} from "./gpx-track";

const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="StravaGPX" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Boucle du Quiraing</name>
    <trkseg>
      <trkpt lat="57.6300" lon="-6.2700"><ele>250</ele><time>2026-10-23T09:00:00Z</time></trkpt>
      <trkpt lat="57.6350" lon="-6.2680"><ele>251</ele><time>2026-10-23T09:10:00Z</time></trkpt>
      <trkpt lat="57.6400" lon="-6.2660"><ele>300</ele><time>2026-10-23T09:40:00Z</time></trkpt>
      <trkpt lat="57.6450" lon="-6.2640"><ele>280</ele><time>2026-10-23T10:15:00Z</time></trkpt>
      <trkpt lat="57.6500" lon="-6.2620"><ele>330</ele><time>2026-10-23T11:05:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const stageFixture = (route: TripStage["route"]): TripStage => ({
  code: "GLC",
  coordinates: route.at(-1) ?? [-3.19, 55.95],
  dateLabel: "21 oct.",
  dayLabel: "J03",
  detail: "",
  highlights: [],
  id: "etape",
  photos: [],
  route,
  title: "Glencoe",
  tracks: [],
});

describe("traces GPX", () => {
  it("lit le nom, les positions, altitudes et horodatages d'un export Strava", () => {
    const { name, points } = parseGpx(gpx, "fichier.gpx");

    expect(name).toBe("Boucle du Quiraing");
    expect(points).toHaveLength(5);
    expect(points[0].position).toEqual([-6.27, 57.63]);
    expect(points[0].ele).toBe(250);
    expect(points[0].time).toBe(Date.parse("2026-10-23T09:00:00Z"));
  });

  it("calcule distance, D+ filtre du bruit et duree", () => {
    const stats = trackStats(parseGpx(gpx, "x").points);

    expect(stats.distanceKm).toBeGreaterThan(2.1);
    expect(stats.distanceKm).toBeLessThan(2.4);
    // Le +1 m (bruit) ne deplace pas la reference: 250 -> 300 puis 280 -> 330.
    expect(stats.ascentM).toBe(100);
    expect(stats.maxEleM).toBe(330);
    expect(formatDuration(stats.durationMs ?? 0)).toBe("2 h 05");
  });

  it("produit un profil et des troncons colores par altitude", () => {
    const { points } = parseGpx(gpx, "x");
    const track = {
      kind: "randonnee" as const,
      name: "x",
      points,
      stageIndex: 3,
    };

    expect(elevationProfile(points).at(-1)?.eleM).toBe(330);
    const segments = elevationSegments([track], 2);
    expect(segments.features).toHaveLength(2);
    expect(segments.features[0].properties?.color).toMatch(/^rgb\(/);
  });

  it("utilise le nom du fichier et accepte un itineraire sans trace", () => {
    const route = `<gpx><rte><rtept lat="56" lon="-4"/><rtept lat="57" lon="-5"/></rte></gpx>`;
    const { name, points } = parseGpx(route, "skye.gpx");

    expect(name).toBe("skye.gpx");
    expect(points).toHaveLength(2);
    expect(trackStats(points).ascentM).toBeNull();
  });

  it("refuse un fichier qui n'est pas du XML", () => {
    expect(() => parseGpx("pas un gpx <", "casse.gpx")).toThrow(/illisible/);
  });

  it("affiche la distance reelle d'un trajet GPS et ignore les randonnees", () => {
    const glencoe = stageFixture([
      [-3.19, 55.95],
      [-3.95, 56.12],
      [-5.1, 56.68],
    ]);
    const { points } = parseGpx(gpx, "x");
    const hike = {
      kind: "randonnee" as const,
      name: "R",
      points,
      stageIndex: 1,
    };
    const drive = { kind: "trajet" as const, name: "T", points, stageIndex: 1 };

    // Sans trajet GPS: distance du trace reconstitue, arrondie et approchee.
    expect(formatDistance(stageDistance(glencoe, 1, [hike]))).toMatch(
      /^≈ \d+ km$/,
    );
    // Avec trajet GPS: distance exacte du fichier.
    expect(stageDistance(glencoe, 1, [hike, drive])).toEqual({
      exact: true,
      km: trackStats(points).distanceKm,
    });
    expect(formatDistance(stageDistance(stageFixture([]), 0, []))).toBe("Base");
  });
});
