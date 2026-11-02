import { describe, expect, it } from "vitest";
import type { Airport, Flight } from "./trip-types";
import { outboundJourney } from "./trip-types";

const place = (code: string): Airport => ({
  code,
  city: code,
  name: code,
  coordinates: [0, 0],
});
const leg = (from: string, to: string): Flight => ({
  from: place(from),
  to: place(to),
  mode: "avion",
});
const codes = (flights: Flight[]) => {
  const { from, to } = outboundJourney(flights);
  return `${from.code} → ${to.code}`;
};

describe("aller du voyage (billet)", () => {
  it("un seul trajet: son depart et son arrivee", () => {
    expect(codes([leg("CRL", "EDI")])).toBe("CRL → EDI");
  });

  it("trajets enchaines: depart du premier, arrivee du dernier", () => {
    expect(codes([leg("MSN", "CRL"), leg("CRL", "EDI")])).toBe("MSN → EDI");
  });

  it("un retour depuis une autre ville ne change pas la destination", () => {
    expect(codes([leg("CRL", "EDI"), leg("INV", "CRL")])).toBe("CRL → EDI");
    expect(
      codes([leg("MSN", "CRL"), leg("CRL", "EDI"), leg("INV", "CRL")]),
    ).toBe("MSN → EDI");
  });
});
