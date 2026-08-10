// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SiteRouter from "./site-router";

vi.mock("../sites/portfolio/portfolio-site", () => ({
  PortfolioSite: () => <p>Portfolio</p>,
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
vi.mock("../sites/voyage/islande-trip-site", () => ({
  IslandeTripSite: () => <p>Carnet Islande</p>,
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

  it("affiche le carnet Islande", () => {
    window.history.replaceState({}, "", "/voyage/islande-2026");
    render(<SiteRouter />);

    expect(screen.getByText("Carnet Islande")).toBeTruthy();
  });
});
