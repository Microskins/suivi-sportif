// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { BodyMeasurement } from "../api/client";
import { DashboardOverview } from "./DashboardOverview";

vi.mock("recharts", () => {
  const Stub = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

  return {
    Bar: () => null,
    BarChart: Stub,
    CartesianGrid: () => null,
    Legend: () => null,
    Line: () => null,
    LineChart: Stub,
    ResponsiveContainer: Stub,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

function buildMeasurement(
  overrides: Partial<BodyMeasurement> & Pick<BodyMeasurement, "id" | "date">,
): BodyMeasurement {
  return {
    id: overrides.id,
    userId: "user-1",
    date: overrides.date,
    silhouette: "MALE",
    isActiveLifestyle: null,
    weightKg: null,
    heightCm: null,
    chestCm: null,
    waistCm: null,
    hipsCm: null,
    neckCm: null,
    shouldersCm: null,
    leftArmCm: null,
    rightArmCm: null,
    leftForearmCm: null,
    rightForearmCm: null,
    leftThighCm: null,
    rightThighCm: null,
    leftCalfCm: null,
    rightCalfCm: null,
    notes: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("DashboardOverview", () => {
  it("shows the latest body weight summary in the dashboard synthesis", () => {
    render(
      <DashboardOverview
        bodyMeasurements={[
          buildMeasurement({
            id: "weight-latest",
            date: "2026-06-08T08:00:00.000Z",
            weightKg: 82.4,
            updatedAt: "2026-06-08T08:00:00.000Z",
            createdAt: "2026-06-08T08:00:00.000Z",
          }),
          buildMeasurement({
            id: "weight-previous",
            date: "2026-06-01T08:00:00.000Z",
            weightKg: 83.1,
            updatedAt: "2026-06-01T08:00:00.000Z",
            createdAt: "2026-06-01T08:00:00.000Z",
          }),
        ]}
        workouts={[]}
        meals={[]}
        nutritionGoals={[]}
        userGoals={[]}
        isLoading={false}
        onQuickAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Poids corporel")).toBeInTheDocument();
    expect(screen.getByText("82,4 kg")).toBeInTheDocument();
    expect(screen.getByText(/08\/06\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/-0,7 kg vs precedente/)).toBeInTheDocument();
  });

  it("offers a quick action to take a new body weight measurement", () => {
    const onQuickAction = vi.fn();

    render(
      <DashboardOverview
        bodyMeasurements={[]}
        workouts={[]}
        meals={[]}
        nutritionGoals={[]}
        userGoals={[]}
        isLoading={false}
        onQuickAction={onQuickAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Prendre une pesee" }));

    expect(onQuickAction).toHaveBeenCalledWith("measurement");
  });
});
