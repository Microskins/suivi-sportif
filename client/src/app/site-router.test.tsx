// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SiteRouter from "./site-router";

vi.mock("../sites/portfolio/portfolio-site", () => ({
  PortfolioSite: () => <p>Portfolio</p>,
}));
vi.mock("../sites/prix-aliments/price-comparison-site", () => ({
  PriceComparisonSite: () => <p>Comparateur de prix</p>,
}));
vi.mock("../sites/suivi-sportif/suivi-sportif-site", () => ({
  SuiviSportifSite: () => <p>Suivi Sportif</p>,
}));
vi.mock("../sites/trekking/trekking-home-site", () => ({
  TrekkingHomeSite: () => <p>Trekking</p>,
}));
vi.mock("../sites/trekking/vosges-wild-site", () => ({
  VosgesWildSite: () => <p>Vosges</p>,
}));
vi.mock("../sites/voyage/voyage-home-site", () => ({
  VoyageHomeSite: () => <p>Catalogue Voyage</p>,
}));
vi.mock("../sites/voyage/trip-site", () => ({
  TripSite: ({ slug }: { slug: string }) => <p>Carnet {slug}</p>,
}));

vi.mock("../sites/voyage/admin-site", () => ({
  default: () => <p>Administration Voyage</p>,
}));

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("routes du site Voyage", () => {
  it("affiche le catalogue", () => {
    window.history.replaceState({}, "", "/voyage");
    render(<SiteRouter />);

    expect(screen.getByText("Catalogue Voyage")).toBeTruthy();
  });

  it("ouvre le carnet designe par le slug", () => {
    window.history.replaceState({}, "", "/voyage/ecosse-2026");
    render(<SiteRouter />);

    expect(screen.getByText("Carnet ecosse-2026")).toBeTruthy();
  });

  it("ouvre l'administration plutot qu'un carnet nomme admin", async () => {
    window.history.replaceState({}, "", "/voyage/admin");
    render(<SiteRouter />);

    expect(await screen.findByText("Administration Voyage")).toBeTruthy();
    expect(screen.queryByText("Carnet admin")).toBeNull();
  });
});

describe("route du comparateur de prix", () => {
  it("affiche le comparateur alimentaire", () => {
    window.history.replaceState({}, "", "/prix-aliments");
    render(<SiteRouter />);

    expect(screen.getByText("Comparateur de prix")).toBeTruthy();
  });
});
