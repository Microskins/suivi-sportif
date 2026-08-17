// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usePriceComparisonStore } from "./price-comparison-store";
import { PriceComparisonSite } from "./price-comparison-site";

beforeEach(() => {
  usePriceComparisonStore.setState({ category: "Tous", query: "" });
});

afterEach(cleanup);

describe("comparateur de prix alimentaires", () => {
  it("presente les quatre enseignes et les produits de demonstration", () => {
    const { container } = render(<PriceComparisonSite />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /le même panier. pas le même prix./i,
      }),
    ).toBeTruthy();
    expect(screen.getAllByText("Carrefour").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Intermarché").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ALDI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Colruyt").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/8 produits · prix de démonstration/i),
    ).toBeTruthy();
    expect(container.querySelector(".receipt")).toBeTruthy();
    expect(container.querySelectorAll(".best-row")).toHaveLength(8);
  });

  it("affiche la zone et les quatre points de vente selectionnes", () => {
    render(<PriceComparisonSite />);

    expect(screen.getAllByText("59278").length).toBeGreaterThan(0);
    expect(screen.getByText("Intermarché Super Escautpont")).toBeTruthy();
    expect(screen.getByText("Carrefour Condé-sur-l’Escaut")).toBeTruthy();
    expect(screen.getByText("ALDI Fresnes-sur-Escaut")).toBeTruthy();
    expect(screen.getByText("Colruyt Péruwelz New")).toBeTruthy();
    expect(
      screen.getByLabelText("260 rue Jean Jaurès, 59970 Fresnes-sur-Escaut"),
    ).toBeTruthy();
    expect(screen.getByText(/point de vente transfrontalier/i)).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: /ouvrir la fiche officielle/i }),
    ).toHaveLength(4);
  });

  it("filtre les produits pendant la recherche", () => {
    render(<PriceComparisonSite />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: /quel aliment cherchez-vous/i }),
      {
        target: { value: "pates" },
      },
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Penne rigate" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Bananes" }),
    ).toBeNull();
    expect(screen.getByText(/1 produit · prix de démonstration/i)).toBeTruthy();
  });

  it("propose de reinitialiser une recherche sans resultat", () => {
    render(<PriceComparisonSite />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: /quel aliment cherchez-vous/i }),
      {
        target: { value: "chocolat noir" },
      },
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Rien dans ce rayon" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /reprendre le ticket/i }),
    );

    expect(
      screen.getByText(/8 produits · prix de démonstration/i),
    ).toBeTruthy();
  });
});
