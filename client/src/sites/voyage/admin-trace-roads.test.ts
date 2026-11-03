import { afterEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "./admin-api";
import type { StageDraft } from "./admin-form";
import { emptyStage } from "./admin-form";
import { traceStageRoads } from "./admin-trace-roads";
import type { LngLat } from "./trip-types";

const stage = (key: string, lng: number, lat: number): StageDraft => ({
  ...emptyStage(),
  key,
  lng: String(lng),
  lat: String(lat),
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("tracer par la route (admin)", () => {
  it("passe par le depart de la randonnee et repart de son arrivee", async () => {
    vi.useFakeTimers();
    const inverness = stage("a", -4.2, 57.48);
    const portree = {
      ...stage("b", -6.19, 57.41),
      tracks: [
        {
          id: "h1",
          kind: "randonnee" as const,
          name: "Old Man of Storr",
          url: "",
        },
        { id: "t1", kind: "trajet" as const, name: "Route", url: "" },
      ],
    };
    vi.spyOn(adminApi, "trackEndpoints").mockResolvedValue({
      start: [-6.17, 57.5],
      end: [-6.18, 57.52],
    });
    const road = vi
      .spyOn(adminApi, "roadRoute")
      .mockImplementation(async (from: LngLat, to: LngLat) => ({
        distanceKm: 50,
        route: [from, to],
      }));

    const pending = traceStageRoads([inverness, portree], {
      onAuthError: () => false,
      onProgress: () => {},
    });
    await vi.runAllTimersAsync();
    const result = await pending;

    // Seule la randonnee compte, pas la trace de trajet.
    expect(adminApi.trackEndpoints).toHaveBeenCalledTimes(1);
    expect(road.mock.calls).toEqual([
      [
        [-4.2, 57.48],
        [-6.17, 57.5],
      ],
      [
        [-6.18, 57.52],
        [-6.19, 57.41],
      ],
    ]);
    expect(result?.routes.get("b")).toEqual([
      [-4.2, 57.48],
      [-6.17, 57.5],
      [-6.18, 57.52],
      [-6.19, 57.41],
    ]);
    expect(result?.report).toContain("en passant par le départ de 1 randonnée");
    expect(result?.report).toContain("100 km");
  });
});
