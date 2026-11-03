import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
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

const mocks = vi.hoisted(() => ({ trackFileName: vi.fn() }));

vi.mock("../db/queries/voyages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../db/queries/voyages.js")>()),
  ...mocks,
}));

const ADMIN = {
  id: "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11",
  email: "thomas@example.fr",
  name: "T",
};
const OTHER = { ...ADMIN, email: "autre@example.fr" };
const TRACK_ID = "1f9a5a54-0c47-4f9b-8a27-1d6a0f4f2c22";
const FILE = "2e8b7f3a-1c4d-4e5f-9a6b-7c8d9e0f1a2b.gpx";

let app: FastifyInstance;
let uploadDir: string;
const get = (user = ADMIN) =>
  app.inject({
    method: "GET",
    url: `/api/voyages/admin/tracks/${TRACK_ID}/endpoints`,
    headers: { authorization: `Bearer ${generateToken(app, user)}` },
  });

beforeAll(async () => {
  uploadDir = await mkdtemp(path.join(tmpdir(), "voyage-gpx-"));
  await mkdir(path.join(uploadDir, "voyages"));
  await writeFile(
    path.join(uploadDir, "voyages", FILE),
    `<gpx><trk><trkseg><trkpt lat="57.5" lon="-6.15"/><trkpt lat="57.52" lon="-6.18"/></trkseg></trk></gpx>`,
  );
  process.env.UPLOAD_DIR = uploadDir;
  process.env.VOYAGE_ADMIN_EMAILS = "thomas@example.fr";
  app = buildApp({ logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await rm(uploadDir, { recursive: true, force: true });
  delete process.env.UPLOAD_DIR;
  delete process.env.VOYAGE_ADMIN_EMAILS;
});

beforeEach(() => mocks.trackFileName.mockReset());

describe("depart et arrivee d'une randonnee (admin)", () => {
  it("lit le GPX sur le disque", async () => {
    mocks.trackFileName.mockResolvedValue(FILE);
    const response = await get();
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual({
      start: [-6.15, 57.5],
      end: [-6.18, 57.52],
    });
    expect(mocks.trackFileName).toHaveBeenCalledWith(TRACK_ID);
  });

  it("404 pour une trace inconnue, 403 hors admin", async () => {
    mocks.trackFileName.mockResolvedValue(null);
    expect((await get()).statusCode).toBe(404);
    expect((await get(OTHER)).statusCode).toBe(403);
  });
});
