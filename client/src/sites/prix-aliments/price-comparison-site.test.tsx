// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePriceComparisonStore } from "./price-comparison-store";
import { PriceComparisonSite } from "./price-comparison-site";

beforeEach(() => {
  window.history.replaceState({}, "", "/prix-aliments");
  usePriceComparisonStore.setState({ category: "Tous", query: "" });
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(window.navigator, "share", {
    configurable: true,
    value: undefined,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

  it("restaure une recherche partagee depuis l URL", async () => {
    window.history.replaceState(
      {},
      "",
      "/prix-aliments?zone=59278&q=pates&categorie=%C3%89picerie",
    );

    render(<PriceComparisonSite />);

    expect(
      await screen.findByRole("heading", { level: 3, name: "Penne rigate" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Épicerie" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("synchronise les filtres et copie l URL sur desktop", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<PriceComparisonSite />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: /quel aliment cherchez-vous/i }),
      { target: { value: "pâtes" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Épicerie" }));

    await waitFor(() => {
      expect(window.location.search).toBe(
        "?zone=59278&q=p%C3%A2tes&categorie=%C3%89picerie",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /copier le lien/i }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(window.location.href),
    );
    expect(screen.getByText(/lien copié dans le presse-papiers/i)).toBeTruthy();
  });

  it("utilise le partage natif quand il est disponible", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: share,
    });
    render(<PriceComparisonSite />);

    fireEvent.click(screen.getByRole("button", { name: "Partager" }));

    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/Prix Frais/),
        url: expect.stringContaining("?zone=59278"),
      }),
    );
    expect(screen.getByText(/ticket envoyé avec succès/i)).toBeTruthy();
  });

  it("genere un QR code local avec l URL partageable", async () => {
    render(<PriceComparisonSite />);

    const qrCode = await screen.findByAltText(/QR code du ticket 59278-/i);

    expect(qrCode).toHaveAttribute(
      "src",
      expect.stringMatching(/^data:image\/svg\+xml/),
    );
  });

  it("ouvre la boite de dialogue d impression apres preparation du QR", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<PriceComparisonSite />);

    await screen.findByAltText(/QR code du ticket 59278-/i);
    fireEvent.click(screen.getByRole("button", { name: /imprimer/i }));

    expect(print).toHaveBeenCalledOnce();
  });
});
