// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function page(items: unknown[], total: number, pageNumber: number) {
  return jsonResponse({
    data: items,
    meta: { total, page: pageNumber, limit: 100 },
  });
}

function makeExercises(count: number, offset = 0) {
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise-${offset + index}`,
  }));
}

function calledUrls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.map((call) => String(call[0]));
}

describe("api client - recuperation des listes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("demande la taille de page maximale autorisee par l'API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(page([], 0, 1));
    vi.stubGlobal("fetch", fetchMock);

    await api.getExercises();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrls(fetchMock)[0]).toContain("page=1&limit=100");
  });

  it("reconstitue la liste complete quand l'API la tronque en plusieurs pages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(makeExercises(100), 163, 1))
      .mockResolvedValueOnce(page(makeExercises(63, 100), 163, 2));
    vi.stubGlobal("fetch", fetchMock);

    const exercises = await api.getExercises();

    // Le cas concret qui a motive ce mecanisme: la bibliotheque d'exercices
    // depasse une page, et les ecrans calculent des agregats dessus.
    expect(exercises).toHaveLength(163);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calledUrls(fetchMock)[1]).toContain("page=2");
  });

  it("s'arrete des que le total annonce est atteint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(page(makeExercises(5), 5, 1));
    vi.stubGlobal("fetch", fetchMock);

    const exercises = await api.getExercises();

    expect(exercises).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ne boucle pas indefiniment si le total annonce est trop grand", async () => {
    // Garde-fou: `total` incoherent avec les pages reellement servies.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(makeExercises(100), 9_999, 1))
      .mockResolvedValueOnce(page([], 9_999, 2));
    vi.stubGlobal("fetch", fetchMock);

    const exercises = await api.getExercises();

    expect(exercises).toHaveLength(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("s'arrete sur une page incomplete quand meta est absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ id: "a" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const exercises = await api.getExercises();

    expect(exercises).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ajoute la pagination sans casser une URL qui a deja une query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(page([], 0, 1));
    vi.stubGlobal("fetch", fetchMock);

    await api.getWorkoutsByDateRange(
      "2026-05-01T00:00:00.000Z",
      "2026-05-31T23:59:59.000Z",
    );

    const url = calledUrls(fetchMock)[0];
    expect(url).toContain("?page=1&limit=100");
    expect(url).not.toContain("??");
  });

  it("propage l'erreur de l'API sans avaler le message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized", code: "UNAUTHORIZED" }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.getExercises()).rejects.toThrow("Unauthorized");
  });
});
