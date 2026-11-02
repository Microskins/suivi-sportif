// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { MealDraft, TripDraft } from "./admin-form";
import {
  draftToPayload,
  emptyStage,
  emptyTrip,
  localErrors,
} from "./admin-form";
import { AdminStageMeals } from "./admin-stage-meals";

function Harness({ onMeals }: { onMeals: (meals: MealDraft[]) => void }) {
  const [meals, setMeals] = useState<MealDraft[]>([]);
  return (
    <AdminStageMeals
      disabled={false}
      errors={{}}
      meals={meals}
      prefix="stages.0."
      stageLabel="Étape 1 — Portree"
      onChange={(next) => {
        setMeals(next);
        onMeals(next);
      }}
    />
  );
}

const tripWith = (meals: MealDraft[]): TripDraft => ({
  ...emptyTrip(),
  stages: [{ ...emptyStage(), lng: "-6.2", lat: "57.4", meals }],
});

afterEach(cleanup);

describe("repas d'une etape (admin)", () => {
  it("ajoute un repas place par sa position, puis le retire", () => {
    let meals: MealDraft[] = [];
    render(<Harness onMeals={(next) => (meals = next)} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter un repas à Étape 1 — Portree",
      }),
    );
    fireEvent.change(screen.getByLabelText("Lieu du repas 1"), {
      target: { value: "Café Arriba" },
    });
    fireEvent.change(screen.getByLabelText("Lien (facultatif)"), {
      target: { value: "https://cafearriba.co.uk" },
    });
    fireEvent.change(screen.getByLabelText("Adresse du lieu"), {
      target: { value: "57.41, -6.19" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Trouver la position" }),
    );

    expect(draftToPayload(tripWith(meals)).stages[0].meals).toEqual([
      {
        name: "Café Arriba",
        coordinates: [-6.19, 57.41],
        url: "https://cafearriba.co.uk",
      },
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retirer Café Arriba de Étape 1 — Portree",
      }),
    );
    expect(meals).toEqual([]);
  });

  it("reste facultatif, mais un repas ajouté demande une position", () => {
    expect(draftToPayload(tripWith([])).stages[0].meals).toEqual([]);
    expect(localErrors(tripWith([]))).toEqual({});

    const unplaced: MealDraft = {
      key: "m1",
      lat: "",
      lng: "",
      name: "Pub",
      url: "",
    };
    expect(localErrors(tripWith([unplaced]))).toEqual({
      "stages.0.meals.0.position":
        "Position manquante : cherchez l’adresse du lieu.",
    });
  });
});
