// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import type { GpxTrack } from "./gpx-track";
import { TripHikesSummary } from "./trip-track-card";

afterEach(cleanup);

const hike = (name: string, start: number): GpxTrack => ({
  kind: "randonnee",
  name,
  stageIndex: 0,
  points: [
    { ele: 100, position: [-6.2, 57.6], time: start },
    { ele: 250, position: [-6.2, 57.61], time: start + 3600000 },
  ],
});

describe("recapitulatif des randonnees d'une etape", () => {
  it("additionne distance, denivele et duree des randonnees", () => {
    render(
      <TripHikesSummary
        tracks={[
          hike("Quiraing", 0),
          hike("Quiraing", 0),
          { ...hike("Route", 0), kind: "trajet" },
        ]}
      />,
    );

    expect(screen.getByText(/2 randonnées/)).toBeTruthy();
    // 2 x 150 m de montee, 2 x 1 h; le trajet en voiture ne compte pas.
    expect(screen.getByText("300 m")).toBeTruthy();
    expect(screen.getByText("2 h 00")).toBeTruthy();
  });

  it("ne s'affiche pas pour une seule randonnee", () => {
    const { container } = render(
      <TripHikesSummary tracks={[hike("Quiraing", 0)]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
