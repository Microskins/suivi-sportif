import { describe, expect, it } from "vitest";
import { joinLegs, roadLegs, splitAtHikes } from "./hike-legs";
import type { LngLat } from "./trip-types";

const A: LngLat = [-4.2, 57.48]; // Inverness
const B: LngLat = [-6.19, 57.41]; // Portree
const S1: LngLat = [-6.17, 57.5]; // depart du Storr
const E1: LngLat = [-6.18, 57.52];
const S2: LngLat = [-6.3, 57.65]; // Quiraing
const E2: LngLat = [-6.27, 57.64];

describe("troncons routiers d'une etape", () => {
  it("sans randonnee: un seul troncon, de l'etape precedente a l'etape", () => {
    expect(roadLegs(A, [], B)).toEqual([[A, B]]);
  });

  it("passe par le depart de chaque randonnee et repart de son arrivee", () => {
    expect(
      roadLegs(
        A,
        [
          { start: S1, end: E1 },
          { start: S2, end: E2 },
        ],
        B,
      ),
    ).toEqual([
      [A, S1],
      [E1, S2],
      [E2, B],
    ]);
  });

  it("met les troncons bout a bout sous le plafond, extremites gardees", () => {
    const leg = (from: number, length: number) =>
      Array.from({ length }, (_, i): LngLat => [from + i / 1000, 57]);
    expect(joinLegs([leg(0, 3), leg(1, 2)])).toHaveLength(5);
    const long = [leg(0, 4000), leg(5, 3000)];
    const joined = joinLegs(long, 1000);
    expect(joined.length).toBeLessThanOrEqual(1000);
    expect(joined[0]).toEqual(long[0][0]);
    expect(joined).toContainEqual(long[0][3999]);
    expect(joined).toContainEqual(long[1][0]);
    expect(joined.at(-1)).toEqual(long[1][2999]);
  });
});

describe("trace recoupe aux randonnees (carte)", () => {
  // Route enregistree: A -> pres de S1, puis pres de E1 -> B.
  const route: LngLat[] = [
    A,
    [-5.5, 57.45],
    [-6.169, 57.499],
    [-6.181, 57.519],
    [-6.185, 57.45],
    B,
  ];
  const hike: LngLat[] = [S1, [-6.175, 57.51], E1];

  it("coupe le trait au depart et le reprend a l'arrivee", () => {
    const { segments, replay } = splitAtHikes(route, [hike]);
    expect(segments).toEqual([route.slice(0, 3), route.slice(3)]);
    // Le rejeu suit la randonnee entre les deux troncons.
    expect(replay).toEqual([...route.slice(0, 3), ...hike, ...route.slice(3)]);
  });

  it("laisse le trace entier quand la randonnee est ailleurs", () => {
    const far: LngLat[] = [
      [-3, 56],
      [-3.01, 56.01],
    ];
    const { segments, replay } = splitAtHikes(route, [far]);
    expect(segments).toEqual([route]);
    expect(replay).toEqual(route);
  });
});
