import {
  afterAll,
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
