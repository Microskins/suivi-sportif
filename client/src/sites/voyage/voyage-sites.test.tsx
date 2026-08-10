// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { IslandeTripSite } from "./islande-trip-site";
import { VoyageHomeSite } from "./voyage-home-site";

afterEach(cleanup);

describe("pages Voyage", () => {
  it("relie le billet du catalogue au carnet Islande", () => {
    render(<VoyageHomeSite />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Partir avec\s*un plan clair\./,
    );
    expect(screen.getByText("CDG")).toBeTruthy();
    expect(screen.getByText("KEF")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /ouvrir/i }).getAttribute("href"),
    ).toBe("/voyage/islande-2026");
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
});
