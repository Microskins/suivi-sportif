import { mkdtemp, readdir, rm } from "node:fs/promises";
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
import { jpegWithGps } from "../lib/photo-gps.fixture.js";

const mocks = vi.hoisted(() => ({ createTrip: vi.fn() }));

vi.mock("../db/queries/voyages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../db/queries/voyages.js")>()),
  ...mocks,
}));

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

let app: FastifyInstance;
let uploadDir: string;
const tokenFor = (user: typeof ADMIN) => `Bearer ${generateToken(app, user)}`;

const upload = (body: Buffer, user = ADMIN) =>
  app.inject({
    method: "POST",
    url: "/api/voyages/admin/meal-photos",
    headers: { authorization: tokenFor(user), "content-type": "image/jpeg" },
    payload: body,
  });

const tripWithMealPhoto = (photo: string) => ({
  slug: "ecosse",
  title: "Ecosse",
  country: "Ecosse",
  stubLabel: "SCO",
  flights: [{ fromCode: "CRL", toCode: "EDI" }],
  stages: [
    {
      code: "EDI",
      dayLabel: "J1",
      dateLabel: "19 oct.",
      title: "Edimbourg",
      coordinates: [-3.19, 55.95],
      meals: [{ name: "The Witchery", coordinates: [-3.19, 55.95], photo }],
    },
  ],
});

beforeAll(async () => {
  uploadDir = await mkdtemp(path.join(tmpdir(), "voyage-repas-"));
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

beforeEach(() => mocks.createTrip.mockReset());

describe("photos des repas", () => {
  it("garde la photo et rend la position GPS de la prise de vue", async () => {
    const response = await upload(jpegWithGps(55.9489, -3.1955));

    expect(response.statusCode).toBe(201);
    const { data } = response.json();
    expect(data.photo).toMatch(/^[0-9a-f-]{36}\.jpg$/);
    expect(data.photoUrl).toBe(`/api/voyages/files/${data.photo}`);
    expect(data.coordinates[0]).toBeCloseTo(-3.1955, 4);
    expect(data.coordinates[1]).toBeCloseTo(55.9489, 4);
    expect(await readdir(path.join(uploadDir, "voyages"))).toContain(
      data.photo,
    );

    // La photo envoyee peut ensuite etre citee par un repas.
    mocks.createTrip.mockResolvedValue({ slug: "ecosse" });
    const created = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: tripWithMealPhoto(data.photo),
    });
    expect(created.statusCode).toBe(201);
    expect(mocks.createTrip.mock.calls[0][1].stages[0].meals[0].photo).toBe(
      data.photo,
    );
  });

  it("accepte une photo sans GPS: la position reste a chercher", async () => {
    const response = await upload(
      Buffer.from([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02, 0xff, 0xd9]),
    );
    expect(response.statusCode).toBe(201);
    expect(response.json().data.coordinates).toBeNull();
  });

  it("refuse un repas qui cite une photo jamais envoyee", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/voyages/admin/trips",
      headers: { authorization: tokenFor(ADMIN) },
      payload: tripWithMealPhoto("8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11.jpg"),
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("MEAL_PHOTO_NOT_FOUND");
    expect(mocks.createTrip).not.toHaveBeenCalled();
  });

  it("refuse ce qui n'est pas une image, et les non-admins", async () => {
    expect((await upload(Buffer.from("<svg/>"))).statusCode).toBe(400);
    expect((await upload(jpegWithGps(1, 1), OTHER)).statusCode).toBe(403);
  });
});
