// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminSite from "./admin-site";
import type { TripDetail, TripSummary } from "./trip-types";

const API = "http://localhost:3001";
const TOKEN_KEY = "voyage-admin-token";

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

const STAGE_1 = "5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a01";
const STAGE_2 = "5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a02";
const TRIP_ID = "0f6f4a8e-2d7b-4a43-9a51-3c1d2b7e9c10";

const ecosse: TripSummary = {
  country: "Écosse",
  description: "Neuf jours d’automne.",
  endDate: "2026-10-27",
  flights: [{ from: charleroi, mode: "avion", to: edinburgh }],
  id: TRIP_ID,
  published: true,
  slug: "ecosse-2026",
  startDate: "2026-10-19",
  status: "realise",
  stubLabel: "SCO / 2026",
  title: "Écosse — Boucle des Highlands",
};

const brouillon: TripSummary = {
  ...ecosse,
  id: "a1",
  published: false,
  slug: "albanie",
  title: "Albanie",
};

const route: [number, number][] = [
  [-3.19, 55.95],
  [-4.2, 56.3],
  [-5.1, 56.68],
];

const ecosseDetail: TripDetail = {
  ...ecosse,
  stages: [
    {
      code: "EDI",
      coordinates: [-3.19, 55.95],
      dateLabel: "19—20 oct.",
      dayLabel: "J01—02",
      detail: "Royal Mile.",
      highlights: ["Royal Mile", "Arthur’s Seat"],
      id: STAGE_1,
      photos: [],
      route: [],
      title: "Édimbourg",
      tracks: [],
    },
    {
      code: "GLC",
      coordinates: [-5.1, 56.68],
      dateLabel: "21 oct.",
      dayLabel: "J03",
      detail: "Glencoe.",
      highlights: [],
      id: STAGE_2,
      photos: [],
      route,
      title: "Glencoe",
      tracks: [],
    },
  ],
};

type Reply = { body?: unknown; status?: number };
type Call = {
  body: unknown;
  headers: Record<string, string>;
  method: string;
  url: string;
};

let calls: Call[] = [];

// Simule l'API: la cle est "METHODE /chemin" (sans la query).
function mockApi(routes: Record<string, Reply | ((call: Call) => Reply)>) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const call: Call = {
        body: init.body,
        headers: (init.headers ?? {}) as Record<string, string>,
        method: init.method ?? "GET",
        url,
      };
      calls.push(call);
      const route = routes[`${call.method} ${new URL(url).pathname}`];
      const reply = typeof route === "function" ? route(call) : route;
      if (!reply) {
        return new Response(JSON.stringify({ error: "?", code: "NOPE" }), {
          status: 404,
        });
      }
      const status = reply.status ?? 200;
      return new Response(status === 204 ? null : JSON.stringify(reply.body), {
        status,
      });
    }),
  );
}

const callTo = (method: string, path: string) =>
  calls.find(
    (call) => call.method === method && new URL(call.url).pathname === path,
  );

const typeIn = (
  label: string | RegExp,
  value: string,
  root: Pick<typeof screen, "getByLabelText"> = screen,
) => fireEvent.change(root.getByLabelText(label), { target: { value } });

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("connexion à l'administration", () => {
  it("connecte, stocke le jeton et l'envoie pour lister les voyages", async () => {
    mockApi({
      "POST /api/users/login": {
        body: { data: { token: "jeton-123", user: { email: "a@b.fr" } } },
      },
      "GET /api/voyages/admin/trips": { body: { data: [ecosse, brouillon] } },
    });
    render(<AdminSite />);

    typeIn("E-mail", "thomas@example.fr");
    typeIn("Mot de passe", "secret");
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Voyages" }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(callTo("POST", "/api/users/login")!.body as string),
    ).toEqual({ email: "thomas@example.fr", password: "secret" });
    expect(window.sessionStorage.getItem(TOKEN_KEY)).toBe("jeton-123");
    await screen.findByText("Albanie");
    expect(
      callTo("GET", "/api/voyages/admin/trips")!.headers.Authorization,
    ).toBe("Bearer jeton-123");
    // Seul le voyage publie propose sa page publique.
    const links = screen.getAllByRole("link", { name: /voir la page/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/voyage/ecosse-2026");
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("affiche les identifiants refusés", async () => {
    mockApi({
      "POST /api/users/login": {
        status: 401,
        body: { error: "Identifiants invalides", code: "INVALID_CREDENTIALS" },
      },
    });
    render(<AdminSite />);
    typeIn("E-mail", "x@y.fr");
    typeIn("Mot de passe", "faux");
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou mot de passe incorrect.",
    );
    expect(window.sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("explique le refus 403 et permet de se déconnecter", async () => {
    window.sessionStorage.setItem(TOKEN_KEY, "jeton-non-admin");
    mockApi({
      "GET /api/voyages/admin/trips": {
        status: 403,
        body: { error: "Acces reserve", code: "VOYAGE_ADMIN_REQUIRED" },
      },
    });
    render(<AdminSite />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Accès refusé");
    expect(alert).toHaveTextContent(/administrateurs du site Voyage/);

    fireEvent.click(
      within(alert).getByRole("button", { name: "Se déconnecter" }),
    );
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(window.sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

describe("édition d'un voyage", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(TOKEN_KEY, "jeton-admin");
  });

  it("crée un voyage avec ses vols et une étape", async () => {
    mockApi({
      "GET /api/voyages/admin/trips": { body: { data: [] } },
      "GET /api/voyages/admin/airports": {
        body: { data: [charleroi, edinburgh] },
      },
      "POST /api/voyages/admin/trips": (call) => ({
        status: 201,
        body: {
          data: {
            ...ecosseDetail,
            ...JSON.parse(call.body as string),
            flights: [{ from: charleroi, mode: "avion", to: edinburgh }],
            stages: [{ ...ecosseDetail.stages[0] }],
          },
        },
      }),
    });
    render(<AdminSite />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Nouveau voyage" }),
    );
    await screen.findAllByRole("option", { name: /^EDI/, hidden: true });

    typeIn("Titre", "Écosse — Boucle des Highlands");
    typeIn("Pays", "Écosse");
    typeIn("Slug (adresse de la page)", "ecosse-2026");
    typeIn("Libellé du talon", "SCO / 2026");
    typeIn("Description", "  Neuf jours d’automne.  ");
    typeIn("Date de début", "2026-10-19");
    typeIn("Date de fin", "2026-10-27");
    fireEvent.click(screen.getByLabelText(/^Publié/));
    typeIn("Trajet 1 — départ", "CRL");
    typeIn("Trajet 1 — arrivée", "EDI");

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une étape" }));
    const stage = within(screen.getAllByRole("listitem").at(-1)!);
    typeIn("Code", "edi", stage);
    typeIn("Jours", "J01—02", stage);
    typeIn("Dates", "19—20 oct.", stage);
    typeIn("Titre de l’étape", "Édimbourg", stage);
    typeIn("Récit", "Royal Mile.", stage);
    typeIn("Temps forts", "Royal Mile, , Arthur’s Seat ", stage);
    typeIn("Longitude", "-3,19", stage);
    typeIn("Latitude", "55.95", stage);

    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le voyage" }),
    );

    expect(await screen.findByText("Voyage créé.")).toBeInTheDocument();
    const post = callTo("POST", "/api/voyages/admin/trips")!;
    expect(post.headers).toMatchObject({
      Authorization: "Bearer jeton-admin",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(post.body as string)).toEqual({
      slug: "ecosse-2026",
      title: "Écosse — Boucle des Highlands",
      country: "Écosse",
      description: "Neuf jours d’automne.",
      stubLabel: "SCO / 2026",
      startDate: "2026-10-19",
      endDate: "2026-10-27",
      published: true,
      flights: [{ fromCode: "CRL", toCode: "EDI", mode: "avion" }],
      stages: [
        {
          code: "edi",
          dayLabel: "J01—02",
          dateLabel: "19—20 oct.",
          title: "Édimbourg",
          detail: "Royal Mile.",
          highlights: ["Royal Mile", "Arthur’s Seat"],
          coordinates: [-3.19, 55.95],
          route: [],
        },
      ],
    });
    // L'etape enregistree accepte desormais des fichiers.
    expect(
      screen.getByRole("button", { name: "Envoyer le GPX" }),
    ).toBeInTheDocument();
  });

  it("garde l'id et le tracé des étapes existantes à l'enregistrement", async () => {
    mockApi({
      "GET /api/voyages/admin/trips": { body: { data: [ecosse] } },
      "GET /api/voyages/admin/airports": {
        body: { data: [charleroi, edinburgh] },
      },
      [`GET /api/voyages/admin/trips/${TRIP_ID}`]: {
        body: { data: ecosseDetail },
      },
      [`PUT /api/voyages/admin/trips/${TRIP_ID}`]: {
        body: { data: ecosseDetail },
      },
    });
    render(<AdminSite />);

    fireEvent.click(
      await screen.findByRole("button", { name: `Modifier ${ecosse.title}` }),
    );
    await screen.findByRole("heading", { level: 1, name: ecosse.title });

    // Glencoe passe en tete, puis une etape est ajoutee a la fin.
    fireEvent.click(
      screen.getByRole("button", { name: "Monter Étape 2 — Glencoe" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ajouter une étape" }));
    const added = screen.getAllByRole("listitem").at(-1)!;
    typeIn("Code", "SKY", within(added));
    typeIn("Longitude", "-6.2", within(added));
    typeIn("Latitude", "57.4", within(added));

    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le voyage" }),
    );
    expect(await screen.findByText("Voyage enregistré.")).toBeInTheDocument();

    const body = JSON.parse(
      callTo("PUT", `/api/voyages/admin/trips/${TRIP_ID}`)!.body as string,
    );
    expect(body.stages.map((stage: { id?: string }) => stage.id)).toEqual([
      STAGE_2,
      STAGE_1,
      undefined,
    ]);
    expect(body.stages[0].route).toEqual(route);
    expect(body.stages[0].coordinates).toEqual([-5.1, 56.68]);
    expect(body.stages[1].highlights).toEqual(["Royal Mile", "Arthur’s Seat"]);
    expect(body.stages[2]).toMatchObject({ code: "SKY", route: [] });
  });

  it("relie les erreurs de validation de l'API aux champs", async () => {
    mockApi({
      "GET /api/voyages/admin/trips": { body: { data: [ecosse] } },
      "GET /api/voyages/admin/airports": { body: { data: [charleroi] } },
      [`GET /api/voyages/admin/trips/${TRIP_ID}`]: {
        body: { data: ecosseDetail },
      },
      [`PUT /api/voyages/admin/trips/${TRIP_ID}`]: {
        status: 400,
        body: {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: [
            {
              code: "too_small",
              minimum: 2,
              type: "string",
              path: ["stages", 1, "code"],
              message: "String must contain at least 2 character(s)",
            },
          ],
        },
      },
    });
    render(<AdminSite />);
    fireEvent.click(
      await screen.findByRole("button", { name: `Modifier ${ecosse.title}` }),
    );
    await screen.findByRole("heading", { level: 1, name: ecosse.title });
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer le voyage" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /champs sont invalides/,
    );
    const codes = screen.getAllByLabelText("Code");
    expect(codes[1]).toHaveAttribute("aria-invalid", "true");
    expect(codes[1]).toHaveAccessibleDescription(
      expect.stringContaining("Au moins 2 caractères."),
    );
  });

  it("envoie un GPX brut sur une étape enregistrée", async () => {
    const track = {
      id: "t1",
      kind: "trajet",
      name: "Edimbourg vers Glencoe",
      url: "/api/voyages/files/x.gpx",
    };
    mockApi({
      "GET /api/voyages/admin/trips": { body: { data: [ecosse] } },
      "GET /api/voyages/admin/airports": { body: { data: [charleroi] } },
      [`GET /api/voyages/admin/trips/${TRIP_ID}`]: {
        body: { data: ecosseDetail },
      },
      [`POST /api/voyages/admin/stages/${STAGE_2}/tracks`]: {
        status: 201,
        body: { data: track },
      },
    });
    render(<AdminSite />);
    fireEvent.click(
      await screen.findByRole("button", { name: `Modifier ${ecosse.title}` }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Modifier Étape 2 — Glencoe" }),
    );
    const form = screen.getByRole("form", {
      name: "Envoyer un GPX — Étape 2 — Glencoe",
    });
    const file = new File(["<gpx></gpx>"], "glencoe.gpx", {
      type: "application/gpx+xml",
    });
    fireEvent.change(within(form).getByLabelText("Type de trace"), {
      target: { value: "trajet" },
    });
    typeIn("Nom de la trace", "Edimbourg vers Glencoe", within(form));
    fireEvent.change(within(form).getByLabelText(/Fichier GPX/), {
      target: { files: [file] },
    });
    // jsdom ne voit pas le fichier injecte dans la validation native du
    // champ requis: on soumet le formulaire directement.
    fireEvent.submit(form);

    expect(
      await screen.findByRole("link", { name: "Edimbourg vers Glencoe" }),
    ).toHaveAttribute("href", `${API}/api/voyages/files/x.gpx`);
    const upload = callTo(
      "POST",
      `/api/voyages/admin/stages/${STAGE_2}/tracks`,
    )!;
    const url = new URL(upload.url);
    expect(url.searchParams.get("kind")).toBe("trajet");
    expect(url.searchParams.get("name")).toBe("Edimbourg vers Glencoe");
    expect(upload.headers).toEqual({
      Authorization: "Bearer jeton-admin",
      "Content-Type": "application/gpx+xml",
    });
    expect(upload.body).toBe(file);
  });
});
