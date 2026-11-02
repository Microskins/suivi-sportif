// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminSite from "./admin-site";
import type { TripDetail, TripSummary } from "./trip-types";

// Bouton « Tracer par la route » de l'admin: les ecrans voisins sont couverts
// par admin-site.test.tsx, ce fichier ne garde que le strict necessaire.
const TRIP_ID = "0f6f4a8e-2d7b-4a43-9a51-3c1d2b7e9c10";
const airport = {
  city: "Édimbourg",
  code: "EDI",
  coordinates: [-3.3725, 55.95] as [number, number],
  name: "Aéroport d’Édimbourg",
};
const trip: TripSummary = {
  country: "Écosse",
  description: "",
  endDate: null,
  flights: [{ from: airport, mode: "avion", to: airport }],
  id: TRIP_ID,
  published: true,
  slug: "ecosse-2026",
  startDate: null,
  status: "realise",
  stubLabel: "",
  title: "Écosse",
};
const stage = (id: string, code: string, coordinates: [number, number]) => ({
  code,
  coordinates,
  dateLabel: "",
  dayLabel: "",
  detail: "",
  highlights: [],
  id,
  photos: [],
  route: [],
  title: code,
  tracks: [],
});
const detail: TripDetail = {
  ...trip,
  stages: [
    stage("5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a01", "EDI", [-3.19, 55.95]),
    stage("5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a02", "GLC", [-5.1, 56.68]),
  ],
};
const roadRoute: [number, number][] = [
  [-3.19, 55.95],
  [-3.94, 56.12],
  [-4.62, 56.34],
  [-5.1, 56.68],
];

type Call = { body: unknown; method: string; path: string };
let calls: Call[] = [];

beforeEach(() => {
  window.sessionStorage.setItem("voyage-admin-token", "jeton-admin");
  calls = [];
  const replies: Record<string, unknown> = {
    "GET /api/voyages/admin/trips": [trip],
    "GET /api/voyages/admin/airports": [airport],
    [`GET /api/voyages/admin/trips/${TRIP_ID}`]: detail,
    "POST /api/voyages/admin/road-route": {
      distanceKm: 196.4,
      route: roadRoute,
    },
    [`PUT /api/voyages/admin/trips/${TRIP_ID}`]: detail,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const call = {
        body: init.body,
        method: init.method ?? "GET",
        path: new URL(url).pathname,
      };
      calls.push(call);
      const data = replies[`${call.method} ${call.path}`];
      return data
        ? new Response(JSON.stringify({ data }))
        : new Response(JSON.stringify({ code: "NOPE" }), { status: 404 });
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

const bodyOf = (method: string, path: string) =>
  JSON.parse(
    calls.find((call) => call.method === method && call.path === path)!
      .body as string,
  );

describe("itinéraires routiers dans l'admin", () => {
  it("trace les étapes par la route puis les enregistre", async () => {
    render(<AdminSite />);
    fireEvent.click(
      await screen.findByRole("button", { name: `Modifier ${trip.title}` }),
    );
    await screen.findByRole("heading", { level: 1, name: trip.title });

    fireEvent.click(
      screen.getByRole("button", { name: "Tracer par la route" }),
    );
    expect(
      await screen.findByText(
        /1 itinéraire\(s\) routier\(s\) tracé\(s\), 196 km/,
      ),
    ).toBeInTheDocument();
    // Un seul calcul: de l'etape 1 (Edimbourg) a l'etape 2 (Glencoe).
    expect(bodyOf("POST", "/api/voyages/admin/road-route")).toEqual({
      from: [-3.19, 55.95],
      to: [-5.1, 56.68],
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le voyage" }),
    );
    expect(await screen.findByText("Voyage enregistré.")).toBeInTheDocument();
    const saved = bodyOf("PUT", `/api/voyages/admin/trips/${TRIP_ID}`);
    expect(saved.stages[0].route).toEqual([]);
    expect(saved.stages[1].route).toEqual(roadRoute);
  });
});
