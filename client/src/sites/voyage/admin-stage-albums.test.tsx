// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminStageAlbums } from "./admin-stage-albums";
import type { StageFiles } from "./admin-stage-files";
import { TripTrackAlbum } from "./trip-track-album";
import type { TripAlbum, TripPhoto, TripTrackFile } from "./trip-types";
import { albumPhotos, hikeAlbums, hikeCover } from "./trip-types";

const STAGE = "5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a01";
const HIKE = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";
const ALBUM = "7b6a5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d";

const photo = (id: string, extra: Partial<TripPhoto> = {}): TripPhoto => ({
  alt: `Photo ${id}`,
  caption: "",
  id,
  url: `/api/voyages/files/${id}.jpg`,
  albumId: ALBUM,
  ...extra,
});
const tracks: TripTrackFile[] = [
  { id: HIKE, kind: "randonnee", name: "Quiraing", url: "/q.gpx" },
  { id: "t2", kind: "trajet", name: "Route", url: "/r.gpx" },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("albums d'une etape", () => {
  it("ordonne un album, reference en tete, sinon la premiere photo", () => {
    const photos = [
      photo("a"),
      photo("b", { albumCover: true }),
      photo("c", { albumId: null }),
      photo("d", { albumId: "autre" }),
    ];
    expect(albumPhotos(photos, ALBUM).map((p) => p.id)).toEqual(["b", "a"]);
    expect(
      albumPhotos([photo("a"), photo("b")], ALBUM).map((p) => p.id),
    ).toEqual(["a", "b"]);
  });

  it("relie la photo de reference a la randonnee liee", () => {
    const stage = {
      albums: [
        { id: ALBUM, name: "Quiraing", trackId: HIKE },
        { id: "vide", name: "Vide", trackId: HIKE },
        { id: "plage", name: "Plage", trackId: null },
      ],
      photos: [photo("a"), photo("b", { albumCover: true })],
    };
    // L'album sans photo n'est pas propose.
    expect(hikeAlbums(stage as never, HIKE).map((a) => a.id)).toEqual([ALBUM]);
    expect(hikeCover(stage as never, HIKE)?.id).toBe("b");
    expect(hikeCover(stage as never, "autre")).toBeNull();
  });
});

describe("diaporama d'un album", () => {
  const album = [photo("a"), photo("b"), photo("c")];

  it("defile tout seul et se met en pause", () => {
    vi.useFakeTimers();
    render(<TripTrackAlbum photos={album} title="Quiraing" />);

    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo a");
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo b");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo b");
  });

  it("se pilote avec precedent, suivant et les pastilles", () => {
    render(<TripTrackAlbum photos={album} title="Quiraing" />);
    expect(
      screen.getByRole("region", { name: "Album photo — Quiraing" }),
    ).toHaveAttribute("aria-roledescription", "carrousel");

    fireEvent.click(screen.getByRole("button", { name: "Photo précédente" }));
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo c");
    fireEvent.click(screen.getByRole("button", { name: "Photo 2 sur 3" }));
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo b");
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });
});

describe("section Albums photo de l'admin", () => {
  type Call = { body?: string; method: string; url: string };

  function mockApi(reply: (call: Call) => unknown) {
    const calls: Call[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const call = {
          url,
          method: init.method ?? "GET",
          body: init.body as string | undefined,
        };
        calls.push(call);
        const data = reply(call);
        return data === undefined
          ? new Response(null, { status: 204 })
          : new Response(JSON.stringify({ data }), { status: 201 });
      }),
    );
    return calls;
  }

  function renderAlbums(files: StageFiles) {
    const onChange = vi.fn();
    render(
      <AdminStageAlbums
        stageId={STAGE}
        stageLabel="Skye"
        onAuthError={() => false}
        onChange={onChange}
        {...files}
      />,
    );
    return onChange;
  }

  it("cree un album lie a une randonnee", async () => {
    const calls = mockApi((call) => ({
      id: ALBUM,
      ...JSON.parse(call.body as string),
    }));
    const onChange = renderAlbums({ albums: [], photos: [], tracks });

    const form = screen.getByRole("form", { name: "Nouvel album — Skye" });
    fireEvent.change(within(form).getByLabelText("Nom du nouvel album"), {
      target: { value: "Crêtes du Quiraing" },
    });
    // Seules les randonnees peuvent etre liees.
    const hikeSelect = within(form).getByLabelText(
      "Randonnée liée (facultatif)",
    );
    expect(
      Array.from(hikeSelect.querySelectorAll("option")).map((o) => o.text),
    ).toEqual(["Aucune randonnée", "Quiraing"]);
    fireEvent.change(hikeSelect, { target: { value: HIKE } });
    fireEvent.click(
      within(form).getByRole("button", { name: "+ Créer l’album" }),
    );

    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(calls[0].url).toMatch(new RegExp(`/stages/${STAGE}/albums$`));
    expect(JSON.parse(calls[0].body as string)).toEqual({
      name: "Crêtes du Quiraing",
      trackId: HIKE,
    });
    expect(onChange.mock.calls[0][0].albums).toEqual([
      { id: ALBUM, name: "Crêtes du Quiraing", trackId: HIKE },
    ]);
  });

  it("montre le lien entre la photo de reference et la randonnee", async () => {
    const calls = mockApi(() => photo("b", { albumCover: true }));
    const album: TripAlbum = { id: ALBUM, name: "Quiraing", trackId: HIKE };
    const onChange = renderAlbums({
      albums: [album],
      photos: [photo("a"), photo("b")],
      tracks,
    });

    expect(
      screen.getByText(
        /bulle avec la photo de référence au départ de la randonnée « Quiraing »/,
      ),
    ).toBeInTheDocument();
    // a, premiere photo rangee, est la reference implicite.
    expect(
      screen.getByRole("button", { name: "Photo a : photo de référence" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Faire de Photo b la photo de référence",
      }),
    );
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const patch = calls.find((call) => call.method === "PATCH")!;
    expect(patch.url).toMatch(/\/photos\/b$/);
    expect(JSON.parse(patch.body as string)).toEqual({ albumCover: true });
  });

  it("ajoute des photos directement dans un album", async () => {
    let uploaded = 0;
    const calls = mockApi((call) => {
      if (call.method !== "POST") return { clientId: null };
      uploaded += 1;
      return photo(`n${uploaded}`, {
        alt: new URL(call.url).searchParams.get("alt")!,
      });
    });
    const onChange = renderAlbums({
      albums: [{ id: ALBUM, name: "Vieille ville", trackId: null }],
      photos: [photo("x", { albumId: null })],
      tracks,
    });
    expect(screen.getByText(/Album vide/)).toBeInTheDocument();

    const input = screen.getByLabelText(
      "Photos à ajouter à l’album Vieille ville",
    );
    const files = ["a.jpg", "b.jpg"].map(
      (name) => new File(["x"], name, { type: "image/jpeg" }),
    );
    fireEvent.change(input, { target: { files } });

    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const posts = calls.filter((call) => call.method === "POST");
    expect(posts).toHaveLength(2);
    const query = new URL(posts[0].url).searchParams;
    expect(query.get("albumId")).toBe(ALBUM);
    // Le nom de l'album sert de texte alternatif, numerote.
    expect(query.get("alt")).toBe("Vieille ville (1/2)");
    const { photos } = onChange.mock.calls[0][0] as StageFiles;
    expect(photos.map((p) => p.id)).toEqual(["x", "n1", "n2"]);
    expect(
      await screen.findByText("2 photos ajoutées à l’album."),
    ).toBeInTheDocument();
  });

  it("supprime un album en gardant ses photos dans l'etape", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockApi(() => undefined);
    const onChange = renderAlbums({
      albums: [{ id: ALBUM, name: "Plage", trackId: null }],
      photos: [photo("a", { albumCover: true })],
      tracks,
    });
    expect(screen.getByText(/Sans randonnée liée/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer l’album" }));

    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const { albums, photos } = onChange.mock.calls[0][0] as StageFiles;
    expect(albums).toEqual([]);
    expect(photos[0]).toMatchObject({ albumId: null, albumCover: false });
  });
});
