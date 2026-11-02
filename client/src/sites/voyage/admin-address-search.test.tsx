// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminAddressSearch } from "./admin-address-search";

function mockGeocode(status: number, body: unknown) {
  const fetchMock = vi.fn(
    async (_url: string) => new Response(JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function searchFor(address: string) {
  fireEvent.change(screen.getByLabelText("Adresse du logement"), {
    target: { value: address },
  });
  fireEvent.click(screen.getByRole("button", { name: "Trouver la position" }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("position d'une etape depuis l'adresse du logement", () => {
  it("remplit la position avec l'adresse choisie", async () => {
    const fetchMock = mockGeocode(200, {
      data: [
        {
          label: "Portree, Île de Skye, Écosse",
          coordinates: [-6.19658, 57.41254],
        },
      ],
    });
    const onPick = vi.fn();
    render(<AdminAddressSearch disabled={false} onPick={onPick} />);

    searchFor("Portree, Skye");
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Utiliser Portree, Île de Skye, Écosse",
      }),
    );

    expect(onPick).toHaveBeenCalledWith([-6.19658, 57.41254]);
    expect(
      screen.getByText("Position reprise de : Portree, Île de Skye, Écosse"),
    ).toBeInTheDocument();
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/api/voyages/admin/geocode");
    expect(url.searchParams.get("q")).toBe("Portree, Skye");
  });

  it("guide quand l'adresse est introuvable ou le service absent", async () => {
    mockGeocode(200, { data: [] });
    render(<AdminAddressSearch disabled={false} onPick={vi.fn()} />);
    searchFor("Nulle part");
    expect(await screen.findByText(/Adresse introuvable/)).toBeInTheDocument();

    mockGeocode(502, {
      error: "Recherche d'adresse indisponible pour le moment.",
      code: "GEOCODING_UNAVAILABLE",
    });
    searchFor("Portree");
    expect(
      await screen.findByText(
        "Recherche d'adresse indisponible pour le moment.",
      ),
    ).toBeInTheDocument();
  });
});
