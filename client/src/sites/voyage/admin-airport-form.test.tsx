// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminFlights } from "./admin-flights";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const typeIn = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

function renderFlights(onAirportSaved = vi.fn()) {
  render(
    <AdminFlights
      airports={[]}
      disabled={false}
      errors={{}}
      flights={[]}
      onAirportSaved={onAirportSaved}
      onAuthError={() => false}
      onChange={vi.fn()}
    />,
  );
  return onAirportSaved;
}

describe("ajout d'un lieu (aeroport ou ville)", () => {
  it("place le lieu par recherche, sans champ latitude ni longitude", async () => {
    const edinburgh = {
      code: "EDI",
      city: "Édimbourg",
      name: "Aéroport d’Édimbourg",
      coordinates: [-3.3725, 55.95],
    };
    const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
      const path = new URL(url).pathname;
      const body =
        path === "/api/voyages/admin/geocode"
          ? {
              data: [
                {
                  label: "Aéroport d’Édimbourg, Écosse",
                  coordinates: [-3.3725, 55.95],
                },
              ],
            }
          : init.method === "PUT"
            ? { data: edinburgh }
            : { error: "?" };
      return new Response(JSON.stringify(body), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onSaved = renderFlights();

    expect(screen.queryByLabelText("Latitude")).toBeNull();
    expect(screen.queryByLabelText("Longitude")).toBeNull();

    typeIn("Code du lieu", "EDI");
    typeIn("Ville", "Édimbourg");
    typeIn("Nom du lieu", "Aéroport d’Édimbourg");
    typeIn("Position du lieu", "Aéroport d’Édimbourg");
    fireEvent.click(
      screen.getByRole("button", { name: "Trouver la position" }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Utiliser Aéroport d’Édimbourg, Écosse",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le lieu" }),
    );

    expect(await screen.findByText(/Lieu EDI enregistré/)).toBeInTheDocument();
    const put = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PUT",
    )!;
    expect(JSON.parse(put[1]!.body as string)).toEqual({
      code: "EDI",
      city: "Édimbourg",
      name: "Aéroport d’Édimbourg",
      latitude: 55.95,
      longitude: -3.3725,
    });
    expect(onSaved).toHaveBeenCalledWith(edinburgh);
    expect(screen.getByLabelText("Position du lieu")).toHaveValue("");
  });

  it("refuse un lieu sans position", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderFlights();

    typeIn("Code du lieu", "LIL");
    typeIn("Ville", "Lille");
    typeIn("Nom du lieu", "Lille");
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le lieu" }),
    );

    expect(
      screen.getByText("Position manquante : cherchez le lieu."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
