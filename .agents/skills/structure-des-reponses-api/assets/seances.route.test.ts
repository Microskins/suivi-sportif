// filepath: server/src/routes/seances.route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import { seancesRoutes } from "./seances.js";

const mocks = vi.hoisted(() => ({
  seances: {
    listSeances: vi.fn(),
    getSeanceById: vi.fn(),
    createSeance: vi.fn(),
    updateSeance: vi.fn(),
    deleteSeance: vi.fn(),
  },
}));

// vi.mock est hoisté par Vitest au-dessus des imports, donc l'import
// statique de seancesRoutes ci-dessus reçoit bien la version mockée.
vi.mock("../db/queries/seances.js", () => mocks.seances);

const USER_ID = "11111111-1111-1111-1111-111111111111";
const SEANCE_ID = "22222222-2222-4222-8222-222222222222";
const JWT_SECRET = "test-only-secret-at-least-32-characters-long";

// Les fixtures doivent respecter le schema de reponse declare dans la route
// (tous les champs `required`, et les formats comme `uuid`). Fastify serialise
// la reponse avec ce schema: un objet incomplet fait echouer la serialisation
// et la route renvoie 500 au lieu de sa reponse normale.
const seance = {
  id: SEANCE_ID,
  userId: USER_ID,
  title: "Full body",
  date: "2026-08-18T18:00:00.000Z",
  status: "PLANNED" as const,
  notes: null,
};

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(fjwt, { secret: JWT_SECRET });
  app.register(seancesRoutes, { prefix: "/api/seances" });
  return app;
}

describe("Séances - convention de réponses API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.resetAllMocks();
    app = buildTestApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  function authHeaders() {
    const token = app.jwt.sign({
      id: USER_ID,
      email: "thomas@example.com",
      name: "Thomas",
    });
    return { authorization: `Bearer ${token}` };
  }

  it("GET / sans token renvoie 401 UNAUTHORIZED", async () => {
    const res = await app.inject({ method: "GET", url: "/api/seances" });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("GET / renvoie la liste paginée au format { data, meta }", async () => {
    mocks.seances.listSeances.mockResolvedValue({
      items: [seance],
      total: 1,
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/seances",
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [seance],
      meta: { total: 1, page: 1, limit: 20 },
    });
    // La couche queries recoit `skip`/`take`, pas `page`/`limit`: c'est la
    // route qui traduit l'un en l'autre.
    expect(mocks.seances.listSeances).toHaveBeenCalledWith(USER_ID, {
      skip: 0,
      take: 20,
    });
  });

  it("GET / plafonne limit à 100 même si la query en demande plus", async () => {
    mocks.seances.listSeances.mockResolvedValue({ items: [], total: 0 });

    await app.inject({
      method: "GET",
      url: "/api/seances?limit=500",
      headers: authHeaders(),
    });

    expect(mocks.seances.listSeances).toHaveBeenCalledWith(USER_ID, {
      skip: 0,
      take: 100,
    });
  });

  it("GET /:id renvoie 404 SEANCE_NOT_FOUND si la séance n'existe pas ou n'appartient pas à l'utilisateur", async () => {
    mocks.seances.getSeanceById.mockResolvedValue(null);

    const res = await app.inject({
      method: "GET",
      url: "/api/seances/22222222-2222-2222-2222-222222222222",
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: "SEANCE_NOT_FOUND" });
  });

  it("GET /:id renvoie le détail au format { data }", async () => {
    mocks.seances.getSeanceById.mockResolvedValue(seance);

    const res = await app.inject({
      method: "GET",
      url: `/api/seances/${SEANCE_ID}`,
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: seance });
    expect(mocks.seances.getSeanceById).toHaveBeenCalledWith(
      SEANCE_ID,
      USER_ID,
    );
  });

  it("POST / sans token et avec un corps invalide renvoie 401, pas 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/seances",
      payload: { title: "" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("POST / avec un corps invalide renvoie 400 VALIDATION_ERROR avec details", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/seances",
      headers: authHeaders(),
      payload: { title: "" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(res.json().details).toEqual(expect.any(Array));
  });

  it("POST / valide crée la séance et renvoie 201 au format { data }", async () => {
    const created = {
      ...seance,
      title: "Course 8km",
      date: "2026-08-20T07:00:00.000Z",
    };
    mocks.seances.createSeance.mockResolvedValue(created);

    const res = await app.inject({
      method: "POST",
      url: "/api/seances",
      headers: authHeaders(),
      payload: { title: "Course 8km", date: "2026-08-20T07:00:00.000Z" },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ data: created });
  });

  it("PUT /:id sur une séance introuvable renvoie 404 SEANCE_NOT_FOUND", async () => {
    mocks.seances.updateSeance.mockResolvedValue(null);

    const res = await app.inject({
      method: "PUT",
      url: "/api/seances/33333333-3333-3333-3333-333333333333",
      headers: authHeaders(),
      payload: { title: "Course 10km" },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: "SEANCE_NOT_FOUND" });
  });

  it("DELETE /:id supprimée renvoie 204 sans corps", async () => {
    mocks.seances.deleteSeance.mockResolvedValue(true);

    const res = await app.inject({
      method: "DELETE",
      url: "/api/seances/44444444-4444-4444-4444-444444444444",
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
  });

  it("DELETE /:id sur une séance introuvable renvoie 404 SEANCE_NOT_FOUND", async () => {
    mocks.seances.deleteSeance.mockResolvedValue(false);

    const res = await app.inject({
      method: "DELETE",
      url: "/api/seances/55555555-5555-5555-5555-555555555555",
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: "SEANCE_NOT_FOUND" });
  });
});
