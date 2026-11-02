import { describe, expect, it } from "vitest";
import type { StageDraft } from "./admin-form";
import { emptyStage, placeStage } from "./admin-form";
import type { LngLat } from "./trip-types";

const stage = (key: string, route: LngLat[]): StageDraft => ({
  ...emptyStage(),
  key,
  lng: "-6",
  lat: "57",
  route,
});

describe("nouvelle position d'une etape", () => {
  it("efface son trace et celui de l'etape suivante, pas les autres", () => {
    const route: LngLat[] = [
      [-3, 56],
      [-6, 57],
    ];
    const stages = [
      stage("a", []),
      stage("b", route),
      stage("c", route),
      stage("d", route),
    ];

    const placed = placeStage(stages, "b", [-6.19658, 57.41254]);

    expect(placed[1]).toMatchObject({ lng: "-6.19658", lat: "57.41254" });
    expect(placed.map((s) => s.route.length)).toEqual([0, 0, 0, 2]);
  });
});
