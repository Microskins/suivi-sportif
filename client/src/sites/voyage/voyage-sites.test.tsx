// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { routeLengthKm, ecosseStages } from "./ecosse-2026-data";
import { EcosseTripSite } from "./ecosse-trip-site";
import { IslandeTripSite } from "./islande-trip-site";
import { VoyageHomeSite } from "./voyage-home-site";

afterEach(cleanup);

// jsdom n'implemente pas WebGL: la carte doit alors basculer sur son repli.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

describe("pages Voyage", () => {
  it("presente le globe et relie chaque billet a son carnet", () => {
    render(<VoyageHomeSite />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Partir avec\s*un plan clair\./,
    );
    // Un billet par voyage du catalogue, sous le globe.
    expect(screen.getAllByText("CDG")).toHaveLength(2);
    expect(screen.getByText("KEF")).toBeTruthy();
    expect(screen.getByText("EDI")).toBeTruthy();
    // Sans WebGL, le globe s'efface et renvoie vers les billets.
    expect(screen.getByRole("status")).toHaveTextContent(/billets/i);
    expect(
      screen.getByRole("link", { name: /ouvrir/i }).getAttribute("href"),
    ).toBe("/voyage/islande-2026");
    expect(
      screen.getByRole("link", { name: /revivre/i }).getAttribute("href"),
    ).toBe("/voyage/ecosse-2026");
  });

  it("presente la carte et les reservations sans lien prive", () => {
    render(<IslandeTripSite />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Islande — Route du Sud",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("img", { name: /itinéraire schématique/i }),
    ).toBeTruthy();
    expect(screen.getByText("Airbnb — nuits 1 à 2")).toBeTruthy();
    expect(screen.getByText(/aucun lien privé/i)).toBeTruthy();
  });

  it("presente le carnet Ecosse avec une carte en repli sans WebGL", () => {
    render(<EcosseTripSite />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Écosse — Boucle des Highlands",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Relief 3D" })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent(/indisponible/i);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Stirling, Loch Lomond et Glencoe",
      }),
    ).toBeTruthy();
  });

  it("enchaine chaque troncon sur l'etape precedente", () => {
    ecosseStages.slice(1).forEach((stage, index) => {
      expect(stage.route[0]).toEqual(ecosseStages[index].position);
      expect(stage.route.at(-1)).toEqual(stage.position);
      expect(routeLengthKm(stage.route)).toBeGreaterThan(0);
    });
  });
});
