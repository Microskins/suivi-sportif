import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { generateToken } from "../plugins/auth.js";
import { tripStatus } from "../db/queries/voyages.js";
import { detectPhotoExtension, looksLikeGpx } from "../lib/voyage-files.js";
import { consistentRoutes } from "../lib/stage-routes.js";
import { geocodeAttempts } from "../services/geocoding.js";
import { tripStageInputSchema } from "../schemas/voyages.js";

const mocks = vi.hoisted(() => ({
  listPublishedTrips: vi.fn(),
  getPublishedTrip: vi.fn(),
  listAllTrips: vi.fn(),
  createTrip: vi.fn(),
  stageExists: vi.fn(),
}));

vi.mock("../db/queries/voyages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../db/queries/voyages.js")>()),
  ...mocks,
}));

const ADMIN = {
  id: "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11",
  email: "Thomas@Example.fr",
  name: "T",
};
const OTHER = {
  id: "1f9a5a54-0c47-4f9b-8a27-1d6a0f4f2c22",
  email: "autre@example.fr",
  name: "A",
};

let app: FastifyInstance;
const tokenFor = (user: typeof ADMIN) => `Bearer ${generateToken(app, user)}`;

beforeAll(async () => {
  process.env.VOYAGE_ADMIN_EMAILS = "thomas@example.fr, autre-admin@example.fr";
  app = buildApp({ logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  delete process.env.VOYAGE_ADMIN_EMAILS;
});

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

describe("lecture publique des voyages", () => {
  it("liste les voyages publies sans authentification", async () => {
    mocks.listPublishedTrips.mockResolvedValue([{ slug: "ecosse-2026" }]);
    const response = await app.inject({ method: "GET", url: "/api/voyages" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [{ slug: "ecosse-2026" }] });
  });

  it("renvoie 404 pour un carnet inconnu ou non publie", async () => {
    mocks.getPublishedTrip.mockResolvedValue(null);
    const response = await app.inject({
      method: "GET",
      url: "/api/voyages/inconnu",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("TRIP_NOT_FOUND");
  });

  it("refuse un nom de fichier qui n'est pas genere par le serveur", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/voyages/files/..%2F..%2Fetc%2Fpasswd",
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("administration des voyages", () => {
  it("exige un jeton", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/voyages/admin/trips",
    });
    expect(response.statusCode).toBe(401);
  });

  it("refuse un compte connecte mais absent de VOYAGE_ADMIN_EMAILS", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(OTHER) },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("VOYAGE_ADMIN_REQUIRED");
    expect(mocks.listAllTrips).not.toHaveBeenCalled();
  });

  it("accepte un admin quelle que soit la casse de son e-mail", async () => {
    mocks.listAllTrips.mockResolvedValue([]);
    const response = await app.inject({
      method: "GET",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
    });

    expect(response.statusCode).toBe(200);
  });

  it("valide le voyage avant toute ecriture", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: {
        slug: "Pas Un Slug",
        title: "X",
        country: "X",
        stubLabel: "X",
        flights: [],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_ERROR");
    expect(mocks.createTrip).not.toHaveBeenCalled();
  });

  it("rattache le voyage cree au compte admin", async () => {
    mocks.createTrip.mockResolvedValue({ slug: "albanie" });
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: {
        slug: "albanie",
        title: "Albanie",
        country: "Albanie",
        stubLabel: "ALB",
        flights: [{ fromCode: "bva", toCode: "TIA" }],
      },
    });

    expect(response.statusCode).toBe(201);
    expect(mocks.createTrip).toHaveBeenCalledWith(
      ADMIN.id,
      expect.objectContaining({
        flights: [{ fromCode: "BVA", toCode: "TIA", mode: "avion" }],
        stages: [],
      }),
    );
  });

  it("accepte un trajet en voiture", async () => {
    mocks.createTrip.mockResolvedValue({ slug: "vosges" });
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: {
        slug: "vosges",
        title: "Vosges",
        country: "France",
        stubLabel: "VOS",
        flights: [{ fromCode: "LIL", toCode: "GER", mode: "voiture" }],
      },
    });

    expect(response.statusCode).toBe(201);
    expect(mocks.createTrip.mock.calls[0][1].flights).toEqual([
      { fromCode: "LIL", toCode: "GER", mode: "voiture" },
    ]);
  });

  it("refuse un mode de transport inconnu", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: {
        slug: "x",
        title: "X",
        country: "X",
        stubLabel: "X",
        flights: [{ fromCode: "LIL", toCode: "GER", mode: "train" }],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(mocks.createTrip).not.toHaveBeenCalled();
  });

  it("refuse un fichier qui n'est pas un GPX", async () => {
    mocks.stageExists.mockResolvedValue(true);
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/stages/8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11/tracks?kind=trajet&name=Route",
      headers: {
        authorization: tokenFor(ADMIN),
        "content-type": "application/gpx+xml",
      },
      payload: "<html>pas un gpx</html>",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("UPLOAD_TYPE_NOT_ALLOWED");
  });
});

describe("corps refuses avant la route", () => {
  const photoUrl =
    "/api/voyages/admin/stages/8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11/photos?alt=Photo";

  it("repond 415 pour un type de fichier non gere, pas 500", async () => {
    const response = await app.inject({
      method: "POST",
      url: photoUrl,
      headers: { authorization: tokenFor(ADMIN), "content-type": "image/gif" },
      payload: Buffer.from("GIF89a"),
    });

    expect(response.statusCode).toBe(415);
    expect(response.json().code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("repond 413 pour une photo trop lourde, pas 500", async () => {
    const response = await app.inject({
      method: "POST",
      url: photoUrl,
      headers: { authorization: tokenFor(ADMIN), "content-type": "image/jpeg" },
      payload: Buffer.alloc(16 * 1024 * 1024),
    });

    expect(response.statusCode).toBe(413);
    expect(response.json().code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("accepte un voyage de plus de 1 Mo (traces reconstituees)", async () => {
    mocks.createTrip.mockResolvedValue({ slug: "long" });
    const route = Array.from({ length: 5000 }, (_, index) => [
      -3 - index / 10000,
      55 + index / 10000,
    ]);
    const payload = {
      slug: "long",
      title: "Long",
      country: "Écosse",
      stubLabel: "SCO",
      flights: [{ fromCode: "CRL", toCode: "EDI" }],
      stages: Array.from({ length: 15 }, (_, index) => ({
        code: "EDI",
        dayLabel: `J0${index}`,
        dateLabel: "oct.",
        title: "Etape",
        coordinates: [-3.2, 55.9],
        route,
      })),
    };
    expect(Buffer.byteLength(JSON.stringify(payload))).toBeGreaterThan(
      1024 * 1024,
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload,
    });

    expect(response.statusCode).toBe(201);
  });
});

describe("regles metier des voyages", () => {
  it("deduit le statut des dates, un voyage sans date etant un souvenir", () => {
    const now = new Date("2026-10-29T12:00:00Z");
    expect(tripStatus(null, now)).toBe("realise");
    expect(tripStatus(new Date("2026-10-27"), now)).toBe("realise");
    expect(tripStatus(new Date("2026-10-29"), now)).toBe("a-venir");
    expect(tripStatus(new Date("2027-05-01"), now)).toBe("a-venir");
  });

  it("ramene un lien Airbnb a l'annonce seule, et refuse ce qui n'est pas un lien", () => {
    const stage = {
      code: "EDI",
      dayLabel: "J01",
      dateLabel: "19 oct.",
      title: "Edimbourg",
      coordinates: [-3.2, 55.9],
    };
    const lodging = (lodgingUrl?: string | null) =>
      tripStageInputSchema.safeParse({ ...stage, lodgingUrl });

    expect(
      lodging(
        "https://www.airbnb.fr/rooms/12345678?check_in=2026-10-19&adults=2&source_impression_id=p3",
      ).data?.lodgingUrl,
    ).toBe("https://www.airbnb.fr/rooms/12345678");
    // Lien tel que partage depuis l'appli Airbnb (voyage passe).
    expect(
      lodging(
        "https://www.airbnb.fr/rooms/37630836?guests=1&c=.pi129.pkpast_trip_share_virality&s=67&unique_share_id=e715b078-dec6-4106-9e3f-cfe03b07759a",
      ).data?.lodgingUrl,
    ).toBe("https://www.airbnb.fr/rooms/37630836");
    expect(
      lodging("http://fr.airbnb.ca/rooms/plus/42#photos").data?.lodgingUrl,
    ).toBe("https://fr.airbnb.ca/rooms/42");
    expect(
      lodging("https://www.booking.com/hotel/gb/x.html").data?.lodgingUrl,
    ).toBe("https://www.booking.com/hotel/gb/x.html");
    expect(lodging("").data?.lodgingUrl).toBeNull();
    expect(lodging(undefined).data?.lodgingUrl).toBeNull();
    expect(lodging(null).data?.lodgingUrl).toBeNull();
    expect(lodging("javascript:alert(1)").success).toBe(false);
    expect(lodging("airbnb chez Moira").success).toBe(false);
  });

  it("garde les repas facultatifs et valide chaque point", () => {
    const stage = {
      code: "EDI",
      dayLabel: "J01",
      dateLabel: "19 oct.",
      title: "Edimbourg",
      coordinates: [-3.2, 55.9],
    };
    const parse = (meals?: unknown) =>
      tripStageInputSchema.safeParse({ ...stage, meals });

    expect(parse(undefined).data?.meals).toEqual([]);
    expect(
      parse([
        {
          name: "  The Witchery  ",
          coordinates: [-3.1955, 55.9489],
          url: "https://www.thewitchery.com/#menu",
        },
        { name: "Pub", coordinates: [-3.19, 55.95], url: "" },
        { name: "Chippy", coordinates: [-3.18, 55.94] },
      ]).data?.meals,
    ).toEqual([
      {
        name: "The Witchery",
        coordinates: [-3.1955, 55.9489],
        url: "https://www.thewitchery.com/",
        photo: null,
      },
      { name: "Pub", coordinates: [-3.19, 55.95], url: null, photo: null },
      { name: "Chippy", coordinates: [-3.18, 55.94], url: null, photo: null },
    ]);
    expect(parse([{ name: "", coordinates: [0, 0] }]).success).toBe(false);
    expect(parse([{ name: "Sans position" }]).success).toBe(false);
    expect(
      parse([{ name: "X", coordinates: [0, 0], url: "javascript:alert(1)" }])
        .success,
    ).toBe(false);
    // La photo est un nom rendu par le serveur, jamais un chemin.
    expect(
      parse([{ name: "X", coordinates: [0, 0], photo: "../../etc/passwd" }])
        .success,
    ).toBe(false);
  });

  it("reconnait les formats au contenu, pas a l'extension", () => {
    expect(detectPhotoExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "jpg",
    );
    expect(detectPhotoExtension(Buffer.from("RIFF0000WEBPVP8 "))).toBe("webp");
    expect(detectPhotoExtension(Buffer.from("GIF89a"))).toBeNull();
    expect(
      looksLikeGpx(Buffer.from('<?xml version="1.0"?>\n<gpx version="1.1">')),
    ).toBe(true);
    expect(looksLikeGpx(Buffer.from("<svg></svg>"))).toBe(false);
  });
});

describe("recherche d'adresse (geocodage)", () => {
  const url = (q: string) =>
    `/api/voyages/admin/geocode?${new URLSearchParams({ q })}`;

  it("transforme l'adresse du logement en coordonnees", async () => {
    const fetchMock = vi.fn(
      async (_url: URL) =>
        new Response(
          JSON.stringify([
            {
              display_name: "12 Rue Exemple, Portree, Écosse",
              lat: "57.4125361",
              lon: "-6.1965812",
            },
            { display_name: "Sans position" },
          ]),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await app.inject({
        method: "GET",
        url: url("12 Rue Exemple, Portree"),
        headers: { authorization: tokenFor(ADMIN) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toEqual([
        {
          label: "12 Rue Exemple, Portree, Écosse",
          coordinates: [-6.19658, 57.41254],
        },
      ]);
      const called = new URL(String(fetchMock.mock.calls[0][0]));
      expect(called.hostname).toBe("nominatim.openstreetmap.org");
      expect(called.searchParams.get("q")).toBe("12 Rue Exemple, Portree");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("previent quand le service ne repond pas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    try {
      const response = await app.inject({
        method: "GET",
        url: url("Portree"),
        headers: { authorization: tokenFor(ADMIN) },
      });
      expect(response.statusCode).toBe(502);
      expect(response.json().code).toBe("GEOCODING_UNAVAILABLE");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reste reserve aux administrateurs", async () => {
    const response = await app.inject({
      method: "GET",
      url: url("Portree"),
      headers: { authorization: tokenFor(OTHER) },
    });
    expect(response.statusCode).toBe(403);
  });
});

describe("coherence des traces d'etapes", () => {
  const edi: [number, number] = [-3.1883, 55.9533];
  const sky: [number, number] = [-6.1964, 57.4125];
  const neist: [number, number] = [-6.788, 57.4233];
  const inv: [number, number] = [-4.2247, 57.4778];

  it("ecarte un trace qui passe encore par une etape retiree", () => {
    // Neist Point a ete retire: Inverness garde son trace depuis Neist Point.
    const stages = consistentRoutes([
      { coordinates: edi, route: [] },
      { coordinates: sky, route: [edi, [-5, 56.8], sky] },
      { coordinates: inv, route: [neist, [-5.6, 57.3], inv] },
    ]);

    expect(stages[1].route).toHaveLength(3);
    expect(stages[2].route).toEqual([]);
  });

  it("garde un itineraire routier dont les extremites sont proches des etapes", () => {
    const [, stage] = consistentRoutes([
      { coordinates: edi, route: [] },
      // ~1 km d'ecart: le depart et l'arrivee se calent sur la route.
      {
        coordinates: sky,
        route: [
          [-3.2, 55.96],
          [-5, 56.8],
          [-6.2, 57.42],
        ],
      },
    ]);
    expect(stage.route).toHaveLength(3);
  });

  it("ecarte le trace de la premiere etape et un logement deplace", () => {
    const stages = consistentRoutes([
      { coordinates: edi, route: [sky, edi] },
      { coordinates: neist, route: [edi, sky] },
    ]);
    expect(stages.map((stage) => stage.route)).toEqual([[], []]);
  });
});

describe("adresse de logement introuvable telle quelle", () => {
  const cottage =
    "Foresters Lodge, Farigaig, Inverfarigaig, Inverness IV2 6XR, Royaume-Uni";

  it("elargit la recherche puis tente le code postal britannique seul", () => {
    expect(
      geocodeAttempts(cottage).map((params) => Object.fromEntries(params)),
    ).toEqual([
      { q: cottage },
      { q: "Farigaig, Inverfarigaig, Inverness IV2 6XR, Royaume-Uni" },
      { q: "Inverfarigaig, Inverness IV2 6XR, Royaume-Uni" },
      { postalcode: "IV2 6XR", countrycodes: "gb" },
    ]);
    expect(geocodeAttempts("Portree").map((p) => p.get("q"))).toEqual([
      "Portree",
    ]);
  });

  it("rend le lieu le plus proche, marque approximatif", async () => {
    process.env.GEOCODE_PAUSE_MS = "0";
    const fetchMock = vi.fn(async (url: URL) => {
      const found = url.searchParams.get("postalcode") === "IV2 6XR";
      return new Response(
        JSON.stringify(
          found
            ? [
                {
                  display_name: "IV2 6XR, Highland",
                  lat: "57.2731",
                  lon: "-4.4067",
                },
              ]
            : [],
        ),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await app.inject({
        method: "GET",
        url: `/api/voyages/admin/geocode?${new URLSearchParams({ q: cottage })}`,
        headers: { authorization: tokenFor(ADMIN) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toEqual([
        {
          label: "IV2 6XR, Highland",
          coordinates: [-4.4067, 57.2731],
          approximate: true,
        },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(4);
    } finally {
      vi.unstubAllGlobals();
      delete process.env.GEOCODE_PAUSE_MS;
    }
  });
});

describe("recherche d'adresse par Google (cle configuree)", () => {
  const geocode = (q: string) =>
    app.inject({
      method: "GET",
      url: `/api/voyages/admin/geocode?${new URLSearchParams({ q })}`,
      headers: { authorization: tokenFor(ADMIN) },
    });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.GOOGLE_GEOCODING_API_KEY;
  });

  it("utilise Google en priorite", async () => {
    process.env.GOOGLE_GEOCODING_API_KEY = "cle-test";
    const fetchMock = vi.fn(
      async (_url: URL) =>
        new Response(
          JSON.stringify({
            status: "OK",
            results: [
              {
                formatted_address: "Foresters Lodge, Inverness IV2 6XR, UK",
                geometry: {
                  location: { lat: 57.2696, lng: -4.4072 },
                  location_type: "ROOFTOP",
                },
              },
            ],
          }),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await geocode("Foresters Lodge, Inverness IV2 6XR");

    expect(response.json().data).toEqual([
      {
        label: "Foresters Lodge, Inverness IV2 6XR, UK",
        coordinates: [-4.4072, 57.2696],
      },
    ]);
    const called = fetchMock.mock.calls[0][0];
    expect(called.hostname).toBe("maps.googleapis.com");
    expect(called.searchParams.get("key")).toBe("cle-test");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("repasse par Nominatim si Google refuse la cle", async () => {
    process.env.GOOGLE_GEOCODING_API_KEY = "cle-refusee";
    const fetchMock = vi.fn(async (url: URL) =>
      url.hostname === "maps.googleapis.com"
        ? new Response(JSON.stringify({ status: "REQUEST_DENIED" }))
        : new Response(
            JSON.stringify([
              { display_name: "Portree", lat: "57.41", lon: "-6.19" },
            ]),
          ),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = await geocode("Portree");

    expect(response.statusCode).toBe(200);
    expect(response.json().data[0].label).toBe("Portree");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
