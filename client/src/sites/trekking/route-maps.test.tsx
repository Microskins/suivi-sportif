// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RouteMaps, type TrekRoute } from "./route-maps";

const route: TrekRoute = {
  id: "trace-01",
  label: "Trace 01",
  lineClass: "bg-[#3079ed]",
  mapUrl: "https://www.google.com/maps/d/embed?mid=trace-01",
  externalUrl: "https://www.google.com/maps/d/u/0/viewer?mid=trace-01",
  summary: "Itineraire de la trace 01.",
};

afterEach(cleanup);

describe("RouteMaps", () => {
  it("loads only the selected route map after an explicit action", () => {
    render(<RouteMaps route={route} />);

    expect(document.querySelectorAll("iframe")).toHaveLength(0);
    expect(screen.getByText("Legende:", { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Charger la carte" }));

    const map = document.querySelector<HTMLIFrameElement>("iframe");
    expect(map?.src).toContain("mid=trace-01");
  });
});
