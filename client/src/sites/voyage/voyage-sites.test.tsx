// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TripSite } from "./trip-site";
import type { TripDetail, TripSummary } from "./trip-types";
import { VoyageHomeSite } from "./voyage-home-site";

const charleroi = {
  city: "Charleroi",
  code: "CRL",
  coordinates: [4.4538, 50.4592] as [number, number],
  name: "Aéroport de Bruxelles-Charleroi",
};
const edinburgh = {
  city: "Édimbourg",
  code: "EDI",
  coordinates: [-3.3725, 55.95] as [number, number],
  name: "Aéroport d’Édimbourg",
};

const ecosse: TripSummary = {
  country: "Écosse",
  description: "Neuf jours d’automne d’Édimbourg à l’île de Skye.",
  endDate: "2026-10-27",
  flights: [{ from: charleroi, mode: "avion", to: edinburgh }],
  id: "1",
  published: true,
  slug: "ecosse-2026",
  startDate: "2026-10-19",
  status: "realise",
  stubLabel: "SCO / 2026",
  title: "Écosse — Boucle des Highlands",
};

const ecosseDetail: TripDetail = {
  ...ecosse,
  stages: [
    {
      code: "EDI",
      coordinates: [-3.19, 55.95],
      dateLabel: "19—20 oct.",
      dayLabel: "J01—02",
      detail: "Royal Mile et Arthur’s Seat.",
      highlights: ["Royal Mile"],
      id: "s1",
      lodgingUrl: "https://www.airbnb.fr/rooms/12345678",
      meals: [
        {
          coordinates: [-3.1955, 55.9489],
          name: "The Witchery",
          photo: "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11.jpg",
          photoUrl:
            "/api/voyages/files/8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11.jpg",
          url: "https://www.thewitchery.com/",
        },
      ],
      photos: [],
      route: [],
      title: "Édimbourg, la vieille ville",
      tracks: [],
    },
    {
      code: "GLC",
      coordinates: [-5.1, 56.68],
      dateLabel: "21 oct.",
      dayLabel: "J03",
      detail: "Stirling et Loch Lomond.",
      highlights: [],
      id: "s2",
      lodgingUrl: null,
      meals: [],
      photos: [],
      route: [
        [-3.19, 55.95],
        [-5.1, 56.68],
      ],
      title: "Stirling, Loch Lomond et Glencoe",
      tracks: [],
    },
  ],
};

function mockApi(
  responses: Record<string, { body?: unknown; status?: number }>,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      const response = responses[path] ?? {
        status: 404,
        body: { code: "TRIP_NOT_FOUND" },
      };
      return new Response(JSON.stringify(response.body), {
        status: response.status ?? 200,
      });
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// jsdom n'implemente pas WebGL: globe et carte basculent sur leur repli.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

describe("accueil Voyage", () => {
  it("n'affiche que le globe, avec les carnets en repli sans WebGL", async () => {
    mockApi({ "/api/voyages": { body: { data: [ecosse] } } });
    render(<VoyageHomeSite />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Partir avec\s*un plan clair\./,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/chargement/i);

    // Plus de billets sous le globe: sans WebGL, une liste de liens les
    // remplace pour que chaque carnet reste atteignable.
    expect(await screen.findByText(/globe 3d indisponible/i)).toBeTruthy();
    const link = screen.getByRole("link", {
      name: "Écosse — Boucle des Highlands",
    });
    expect(link.getAttribute("href")).toBe("/voyage/ecosse-2026");
    expect(screen.queryByText("Les billets")).toBeNull();
  });

  it("previent quand l'API ne repond pas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("reseau")));
    render(<VoyageHomeSite />);

    expect(await screen.findByText(/voyages indisponibles/i)).toBeTruthy();
  });
});

describe("carnet de voyage", () => {
  it("presente le carnet complet lu depuis l'API", async () => {
    mockApi({ "/api/voyages/ecosse-2026": { body: { data: ecosseDetail } } });
    render(<TripSite slug="ecosse-2026" />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Écosse — Boucle des Highlands",
      }),
    ).toBeTruthy();
    // Plan 2D seul: plus de choix de modele de carte.
    expect(screen.queryByRole("radio")).toBeNull();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Stirling, Loch Lomond et Glencoe",
      }),
    ).toBeTruthy();
    expect(screen.getByText("9 jours")).toBeTruthy();
    // Le logement de l'etape: la carte et la feuille de route y renvoient.
    const lodging = screen.getAllByRole("link", {
      name: /Logement de l’étape Édimbourg, la vieille ville, sur Airbnb/,
    });
    expect(lodging.length).toBeGreaterThan(0);
    for (const link of lodging) {
      expect(link.getAttribute("href")).toBe(
        "https://www.airbnb.fr/rooms/12345678",
      );
      expect(link.getAttribute("rel")).toContain("noopener");
    }
    // Les repas de l'etape, avec le lien du lieu.
    const meals = screen.getAllByRole("link", {
      name: "The Witchery (nouvel onglet)",
    });
    expect(meals.length).toBeGreaterThan(0);
    expect(meals[0].getAttribute("href")).toBe("https://www.thewitchery.com/");
    expect(
      screen.getAllByRole("img", { name: "Repas à The Witchery" })[0],
    ).toHaveProperty(
      "src",
      expect.stringContaining("/api/voyages/files/8c6c3f1e"),
    );
  });

  it("montre le pays meme quand les etapes restent a ecrire", async () => {
    mockApi({
      "/api/voyages/albanie": {
        body: {
          data: {
            ...ecosse,
            slug: "albanie",
            title: "Albanie",
            startDate: null,
            endDate: null,
            stages: [],
          },
        },
      },
    });
    render(<TripSite slug="albanie" />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Albanie" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/étapes de ce carnet restent à écrire/i),
    ).toBeTruthy();
    expect(screen.queryByText("Étape par étape")).toBeNull();
  });

  it("indique un carnet introuvable", async () => {
    mockApi({});
    render(<TripSite slug="inconnu" />);

    expect(
      await screen.findByText(/n’existe pas ou n’est pas publié/i),
    ).toBeTruthy();
  });
});
