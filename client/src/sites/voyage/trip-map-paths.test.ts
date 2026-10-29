import { describe, expect, it } from "vitest";
import { distanceKm } from "./trip-geometry";
import type { LngLat } from "./trip-types";
import { buildPaths, resample } from "./trip-map-paths";

const a: LngLat = [-4, 56];
const b: LngLat = [-4, 56.1];
const c: LngLat = [-4.2, 56.2];

const stages = [
  { code: "A", coordinates: a, route: [], title: "A" },
  { code: "B", coordinates: b, route: [a, b], title: "B" },
  { code: "C", coordinates: c, route: [b, c], title: "C" },
];

describe("geometrie du trace", () => {
  it("reechantillonne a pas constant", () => {
    const points = resample([a, b, c], 1);
    const steps = points
      .slice(1, -1)
      .map((point, index) => distanceKm(points[index], point));

    steps.forEach((step) => expect(step).toBeCloseTo(1, 1));
    expect(points.at(-1)).toEqual(c);
  });

  it("remplace le trace reconstitue par le GPX trajet de l'etape", () => {
    const gpsPoint = (position: LngLat) => ({ ele: 100, position, time: null });
    const paths = buildPaths(stages, [
      {
        kind: "trajet",
        name: "Route B",
        points: [gpsPoint(a), gpsPoint([-3.95, 56.05]), gpsPoint(b)],
        stageIndex: 1,
      },
    ]);

    // Seule l'etape C reste en tirets; l'etape B passe en trace GPS.
    expect(paths.reconstructed.features).toHaveLength(1);
    expect(paths.reconstructed.features[0].geometry.coordinates).toEqual([
      b,
      c,
    ]);
    expect(paths.gps.features.length).toBeGreaterThan(0);
    expect(paths.stageEnds[0]).toBe(0);
    expect(paths.stageEnds.at(-1)).toBeCloseTo(1);
  });
});
