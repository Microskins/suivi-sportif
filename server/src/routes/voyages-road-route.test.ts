import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { generateToken } from "../plugins/auth.js";
import { simplify } from "../lib/road-route.js";

const ADMIN = {
  id: "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11",
  email: "thomas@example.fr",
  name: "T",
};
const OTHER = {
  id: "1f9a5a54-0c47-4f9b-8a27-1d6a0f4f2c22",
  email: "autre@example.fr",
  name: "A",
};
const EDINBURGH = [-3.1883, 55.9533];
const GLENCOE = [-5.1023, 56.6826];

let app: FastifyInstance;
const tokenFor = (user: typeof ADMIN) => `Bearer ${generateToken(app, user)}`;

function routeRequest(
  user = ADMIN,
  payload: unknown = { from: EDINBURGH, to: GLENCOE },
) {
  return app.inject({
    method: "POST",
    url: "/api/voyages/admin/road-route",
    headers: { authorization: tokenFor(user) },
    payload: payload as Record<string, unknown>,
  });
}

// Le service OSRM est simule: `fetch` global renvoie la reponse voulue et
// garde l'URL appelee. Les autres requetes (aucune ici) ne passent pas.
function stubRouter(
  body: unknown,
  init: ConstructorParameters<typeof Response>[1] = { status: 200 },
) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      return new Response(JSON.stringify(body), init);
    }),
  );
  return calls;
}

beforeAll(async () => {
  process.env.VOYAGE_ADMIN_EMAILS = "thomas@example.fr";
  app = buildApp({ logger: false });
  await app.ready();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.ROUTER_URL;
});

afterAll(async () => {
  await app.close();
  delete process.env.VOYAGE_ADMIN_EMAILS;
});

describe("itineraire routier entre deux etapes", () => {
  it("renvoie le trace simplifie et la distance du service OSRM", async () => {
    // Ligne droite tres dense + un detour: seuls les sommets utiles restent.
    const straight = Array.from({ length: 200 }, (_, i) => [
      -3.1883 - i * 0.01,
      55.9533 + i * 0.0036,
    ]);
    const calls = stubRouter({
      code: "Ok",
      routes: [
        {
          distance: 196_432,
          geometry: { coordinates: [...straight, [-5.0, 56.9], GLENCOE] },
        },
      ],
    });
    process.env.ROUTER_URL = "https://osrm.example.org/";

    const response = await routeRequest();

    expect(response.statusCode).toBe(200);
    expect(calls[0]).toBe(
      "https://osrm.example.org/route/v1/driving/-3.1883,55.9533;-5.1023,56.6826?overview=full&geometries=geojson",
    );
    const { data } = response.json();
    expect(data.distanceKm).toBe(196.4);
    expect(data.route[0]).toEqual(EDINBURGH);
    expect(data.route.at(-1)).toEqual(GLENCOE);
    expect(data.route).toContainEqual([-5.0, 56.9]);
    expect(data.route.length).toBeLessThan(10);
  });

  it("repond 422 quand aucune route ne relie les deux etapes", async () => {
    stubRouter({ code: "NoRoute", routes: [] });
    const response = await routeRequest();
    expect(response.statusCode).toBe(422);
    expect(response.json().code).toBe("ROUTE_NOT_FOUND");
  });

  it("repond 502 quand le service est injoignable ou refuse", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("reseau")));
    expect((await routeRequest()).statusCode).toBe(502);

    // Limite de debit du serveur public: page HTML, pas du JSON.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("<html>Too Many Requests</html>", { status: 429 }),
      ),
    );
    const response = await routeRequest();
    expect(response.statusCode).toBe(502);
    expect(response.json().code).toBe("ROUTER_UNAVAILABLE");
  });

  it("refuse les coordonnees invalides et les comptes non admin", async () => {
    const calls = stubRouter({ code: "Ok", routes: [] });
    expect(
      (await routeRequest(ADMIN, { from: [200, 0], to: GLENCOE })).statusCode,
    ).toBe(400);
    expect((await routeRequest(OTHER)).statusCode).toBe(403);
    expect(calls).toEqual([]);
  });
});

describe("simplification d'un trace", () => {
  it("garde les extremites et les virages, retire les points alignes", () => {
    const line: [number, number][] = [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [1, 0.5],
      [1, 1],
    ];
    expect(simplify(line)).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
  });

  it("reste sous 5000 points pour un tres long trajet sinueux", () => {
    // Route qui serpente sur 2000 km: un virage tous les ~10 points.
    const road = Array.from(
      { length: 40_000 },
      (_, i) => [i * 0.0005, Math.sin(i / 1.6) * 0.002] as [number, number],
    );
    const result = simplify(road);
    expect(result.length).toBeLessThanOrEqual(5000);
    expect(result[0]).toEqual(road[0]);
    expect(result.at(-1)).toEqual(road.at(-1));
  });
});
