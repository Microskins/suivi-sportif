// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Workout } from "../api/client";
import { WorkoutsCalendar } from "./workouts-calendar";

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

afterEach(cleanup);

describe("WorkoutsCalendar", () => {
  it("renders and switches between month and week", () => {
    render(
      <WorkoutsCalendar
        workouts={workouts}
        userGoals={[]}
        isLoading={false}
        onPlan={() => {}}
        onAssociate={async () => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />,
    );

    expect(screen.getByText("Calendrier des séances")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Semaine" }));
    expect(screen.getByRole("button", { name: "Mois" })).toBeTruthy();
  });

  it("calls plan callback from selected day", () => {
    const onPlan = vi.fn();
    render(
      <WorkoutsCalendar
        workouts={workouts}
        userGoals={[]}
        isLoading={false}
        onPlan={onPlan}
        onAssociate={async () => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />,
    );

    const planButtons = screen.getAllByRole("button", {
      name: "Planifier une séance",
    });
    fireEvent.click(planButtons[planButtons.length - 1]);
    expect(onPlan).toHaveBeenCalledTimes(1);
  });

  it("calls associate callback", async () => {
    const onAssociate = vi.fn(async () => {});
    render(
      <WorkoutsCalendar
        workouts={workouts}
        userGoals={[]}
        isLoading={false}
        onPlan={() => {}}
        onAssociate={onAssociate}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />,
    );

    const selectors = screen.getAllByRole("combobox");
    fireEvent.change(selectors[selectors.length - 1], {
      target: { value: "w1" },
    });
    const associateButtons = screen.getAllByRole("button", {
      name: "Associer à ce jour",
    });
    fireEvent.click(associateButtons[associateButtons.length - 1]);
    expect(onAssociate).toHaveBeenCalledTimes(1);
  });
});
