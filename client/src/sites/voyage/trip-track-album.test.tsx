// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminStageFiles } from "./admin-stage-files";
import { TripTrackAlbum } from "./trip-track-album";
import type { TripPhoto, TripTrackFile } from "./trip-types";
import { trackAlbum } from "./trip-types";

const HIKE = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";
const photo = (id: string, extra: Partial<TripPhoto> = {}): TripPhoto => ({
  alt: `Photo ${id}`,
  caption: "",
  id,
  url: `/api/voyages/files/${id}.jpg`,
  trackId: HIKE,
  ...extra,
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("album d'une randonnee", () => {
  it("place la photo de reference en tete, sinon la premiere", () => {
    const photos = [
      photo("a"),
      photo("b", { trackCover: true }),
      photo("c", { trackId: null }),
      photo("d", { trackId: "autre" }),
    ];
    expect(trackAlbum(photos, HIKE).map((p) => p.id)).toEqual(["b", "a"]);
    expect(trackAlbum([photo("a"), photo("b")], HIKE).map((p) => p.id)).toEqual(
      ["a", "b"],
    );
    expect(trackAlbum(photos, "vide")).toEqual([]);
  });
});

describe("diaporama de l'album", () => {
  const album = [photo("a"), photo("b"), photo("c")];

  it("defile tout seul et se met en pause", () => {
    vi.useFakeTimers();
    render(<TripTrackAlbum photos={album} trackName="Quiraing" />);

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
    render(<TripTrackAlbum photos={album} trackName="Quiraing" />);
    const region = screen.getByRole("region", {
      name: "Album photo — Quiraing",
    });
    expect(region).toHaveAttribute("aria-roledescription", "carrousel");

    fireEvent.click(screen.getByRole("button", { name: "Photo précédente" }));
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo c");
    fireEvent.click(screen.getByRole("button", { name: "Photo 2 sur 3" }));
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo b");
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("n'affiche aucun bouton pour une seule photo", () => {
    render(<TripTrackAlbum photos={[photo("a")]} trackName="Quiraing" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("albums dans l'admin", () => {
  const STAGE = "5b0c3c52-7a3e-4c4e-9f0e-6a8f2f8d1a01";
  const tracks: TripTrackFile[] = [
    { id: HIKE, kind: "randonnee", name: "Quiraing", url: "/q.gpx" },
    { id: "t2", kind: "trajet", name: "Route", url: "/r.gpx" },
  ];

  it("classe une photo dans un album, puis en fait la reference", async () => {
    const calls: { body: unknown; method: string; url: string }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        calls.push({ url, method: init.method ?? "GET", body: init.body });
        if (init.method === "PATCH") {
          const changes = JSON.parse(init.body as string);
          return new Response(
            JSON.stringify({
              data: {
                ...photo(url.endsWith("/a") ? "a" : "b"),
                trackCover: false,
                ...changes,
              },
            }),
          );
        }
        return new Response(JSON.stringify({ data: { clientId: null } }));
      }),
    );
    const onChange = vi.fn();
    const { rerender } = render(
      <AdminStageFiles
        stageId={STAGE}
        stageLabel="Skye"
        photos={[photo("a", { trackId: null }), photo("b")]}
        tracks={tracks}
        onAuthError={() => false}
        onChange={onChange}
      />,
    );

    // Seules les randonnees sont proposees comme albums.
    const [albumOfA] = screen.getAllByLabelText("Album");
    expect(
      Array.from(albumOfA.querySelectorAll("option")).map((o) => o.text),
    ).toEqual(["Aucun album", "Randonnée — Quiraing"]);

    fireEvent.change(albumOfA, { target: { value: HIKE } });
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const patch = calls.find((call) => call.method === "PATCH")!;
    expect(patch.url).toMatch(/\/photos\/a$/);
    expect(JSON.parse(patch.body as string)).toEqual({ trackId: HIKE });

    // a, premiere photo de l'album dans l'etape, en est la reference implicite.
    rerender(
      <AdminStageFiles
        stageId={STAGE}
        stageLabel="Skye"
        photos={onChange.mock.calls[0][0].photos}
        tracks={tracks}
        onAuthError={() => false}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("★ Référence")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Faire de Photo b la photo de référence de Quiraing",
      }),
    );
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    const cover = calls.filter((call) => call.method === "PATCH")[1];
    expect(JSON.parse(cover.body as string)).toEqual({ trackCover: true });
    const saved = onChange.mock.calls[1][0].photos as TripPhoto[];
    expect(cover.url).toMatch(/\/photos\/b$/);
    expect(saved.find((p) => p.id === "b")?.trackCover).toBe(true);
  });
});
