import { describe, expect, it } from "vitest";
import {
  buildPriceSearchUrl,
  createTicketNumber,
  readPriceSearchParams,
} from "./price-search-params";

describe("parametres de recherche du comparateur", () => {
  it("lit les filtres valides et ignore une categorie inconnue", () => {
    expect(
      readPriceSearchParams("?zone=59278&q=penne&categorie=%C3%89picerie"),
    ).toEqual({ category: "Épicerie", query: "penne" });
    expect(readPriceSearchParams("?q=lait&categorie=Inconnue")).toEqual({
      category: "Tous",
      query: "lait",
    });
  });

  it("construit une URL compacte avec la zone de comparaison", () => {
    expect(
      buildPriceSearchUrl(
        { hash: "#comparer", pathname: "/prix-aliments" },
        { category: "Épicerie", query: "  pâtes  " },
      ),
    ).toBe(
      "/prix-aliments?zone=59278&q=p%C3%A2tes&categorie=%C3%89picerie#comparer",
    );
  });

  it("produit un numero stable pour une recherche equivalente", () => {
    const firstTicket = createTicketNumber({
      category: "Épicerie",
      query: "Pâtes",
    });
    const equivalentTicket = createTicketNumber({
      category: "Épicerie",
      query: "pates",
    });
    const otherTicket = createTicketNumber({
      category: "Frais",
      query: "lait",
    });

    expect(firstTicket).toBe(equivalentTicket);
    expect(firstTicket).toMatch(/^59278-\d{4}$/);
    expect(otherTicket).not.toBe(firstTicket);
  });
});
