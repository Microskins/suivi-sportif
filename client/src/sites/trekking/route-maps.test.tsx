// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RouteMaps } from "./route-maps";

afterEach(() => {
  cleanup();
});

describe("RouteMaps", () => {
  it("loads each Google map only after an explicit action", () => {
    render(<RouteMaps />);

    expect(document.querySelectorAll("iframe")).toHaveLength(0);
    expect(screen.getByText("Fiche trace 01")).toBeInTheDocument();
    expect(screen.getByText("Fiche trace 02")).toBeInTheDocument();

    const loadButtons = screen.getAllByRole("button", {
      name: "Charger la carte",
    });
    fireEvent.click(loadButtons[0]);

    const firstMap = document.querySelector<HTMLIFrameElement>("iframe");
    expect(firstMap?.src).toContain(
      "mid=1RgMdZ-flBR0RCBd3crgFZPnPmIPzSjk",
    );
    expect(document.querySelectorAll("iframe")).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Charger la carte" }),
    );

    const loadedMapUrls = Array.from(
      document.querySelectorAll<HTMLIFrameElement>("iframe"),
      (iframe) => iframe.src,
    );
    expect(loadedMapUrls).toHaveLength(2);
    expect(loadedMapUrls[1]).toContain(
      "mid=1vvAnoS9xjo8CzyP8p5Et5jnmojIRMe0",
    );
  });
});
