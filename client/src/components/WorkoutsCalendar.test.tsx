// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Workout } from "../api/client";
import { WorkoutsCalendar } from "./WorkoutsCalendar";

const workouts: Workout[] = [
  {
    id: "w1",
    userId: "u1",
    name: "Seance A",
    date: "2026-05-10T18:00:00.000Z",
    status: "PLANNED",
    duration: 45,
    notes: null,
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z",
    exercises: [],
  },
  {
    id: "w2",
    userId: "u1",
    name: "Seance B",
    date: "2026-05-09T18:00:00.000Z",
    status: "COMPLETED",
    duration: 60,
    notes: null,
    createdAt: "2026-05-09T10:00:00.000Z",
    updatedAt: "2026-05-09T10:00:00.000Z",
    exercises: [],
  },
];

describe("WorkoutsCalendar", () => {
  it("renders and switches between month and week", () => {
    render(
      <WorkoutsCalendar
        workouts={workouts}
        isLoading={false}
        onPlan={() => {}}
        onAssociate={async () => {}}
        onEdit={() => {}}
      />,
    );

    expect(screen.getByText("Calendrier des seances")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Semaine" }));
    expect(screen.getByRole("button", { name: "Mois" })).toBeTruthy();
  });

  it("calls plan callback from selected day", () => {
    const onPlan = vi.fn();
    render(
      <WorkoutsCalendar
        workouts={workouts}
        isLoading={false}
        onPlan={onPlan}
        onAssociate={async () => {}}
        onEdit={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Planifier une seance" }));
    expect(onPlan).toHaveBeenCalledTimes(1);
  });

  it("calls associate callback", async () => {
    const onAssociate = vi.fn(async () => {});
    render(
      <WorkoutsCalendar
        workouts={workouts}
        isLoading={false}
        onPlan={() => {}}
        onAssociate={onAssociate}
        onEdit={() => {}}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "w1" } });
    fireEvent.click(screen.getByRole("button", { name: "Associer a ce jour" }));
    expect(onAssociate).toHaveBeenCalledTimes(1);
  });
});
