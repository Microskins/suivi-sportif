import { describe, expect, it } from "vitest";
import { distanceKm } from "./ecosse-2026-data";
import { greatCircle, headingBetween } from "./great-circle";
import { trips } from "./voyage-trips";

describe("arcs de vol", () => {
  it("relie les deux aeroports par le plus court chemin", () => {
    const paris: [number, number] = [2.5479, 49.0097];
    const keflavik: [number, number] = [-22.6056, 63.985];
    const arc = greatCircle(paris, keflavik, 50);

    expect(arc).toHaveLength(51);
    expect(arc[0][0]).toBeCloseTo(paris[0]);
    expect(arc[50][1]).toBeCloseTo(keflavik[1]);
    // Un grand cercle vers l'Islande monte plus au nord que la ligne droite
    // d'une carte a plat.
    expect(Math.max(...arc.map(([, lat]) => lat))).toBeGreaterThanOrEqual(63.9);
    const length = arc
      .slice(1)
      .reduce((sum, point, index) => sum + distanceKm(arc[index], point), 0);
    expect(length).toBeCloseTo(distanceKm(paris, keflavik), 0);
  });

  it("oriente l'avion vers sa destination", () => {
    expect(headingBetween([0, 0], [0, 10])).toBeCloseTo(0);
    expect(headingBetween([0, 0], [10, 0])).toBeCloseTo(90);
  });

  it("donne a chaque voyage au moins un vol et un carnet", () => {
    trips.forEach((trip) => {
      expect(trip.flights.length).toBeGreaterThan(0);
      expect(trip.href).toMatch(/^\/voyage\//);
    });
  });
});
