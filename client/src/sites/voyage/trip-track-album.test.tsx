// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { TripTrackAlbum } from "./trip-track-album";
import type { TripPhoto } from "./trip-types";

afterEach(cleanup);

const photos: TripPhoto[] = [
  { id: "a", alt: "Lac", caption: "Le lac", url: "/files/a.jpg" },
  { id: "b", alt: "Col", caption: "Le col", url: "/files/b.jpg" },
];

describe("album photo en plein ecran", () => {
  it("ouvre, navigue au clavier et se ferme avec Echap", () => {
    render(<TripTrackAlbum photos={photos} title="Quiraing" />);

    fireEvent.click(
      screen.getByRole("button", { name: /Quiraing en plein écran/ }),
    );
    const dialog = screen.getByRole("dialog", { name: /plein écran/ });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fermer le plein écran" }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(dialog).toHaveTextContent("2 / 2");
    expect(dialog).toHaveTextContent("Le col");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Le diaporama reste sur la photo choisie en plein ecran.
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
