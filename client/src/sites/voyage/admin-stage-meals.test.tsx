// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "./admin-api";
import type { MealDraft, TripDraft } from "./admin-form";
import {
  draftToPayload,
  emptyStage,
  emptyTrip,
  localErrors,
  tripToDraft,
} from "./admin-form";
import type { TripDetail } from "./trip-types";
import { AdminStageMeals } from "./admin-stage-meals";

function Harness({ onMeals }: { onMeals: (meals: MealDraft[]) => void }) {
  const [meals, setMeals] = useState<MealDraft[]>([]);
  return (
    <AdminStageMeals
      disabled={false}
      errors={{}}
      meals={meals}
      prefix="stages.0."
      onAuthError={() => false}
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
        photo: null,
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
      photo: null,
      photoUrl: null,
      url: "",
    };
    expect(localErrors(tripWith([unplaced]))).toEqual({
      "stages.0.meals.0.position":
        "Position manquante : cherchez l’adresse du lieu.",
    });
  });

  it("garde chaque repas et sa photo d'un enregistrement à l'autre", () => {
    const photo = "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11.jpg";
    const meal = {
      name: "The Witchery",
      coordinates: [-3.1955, 55.9489] as [number, number],
      url: "https://www.thewitchery.com/",
      photo,
    };
    const detail = {
      ...emptyTrip(),
      flights: [],
      startDate: null,
      endDate: null,
      stages: [
        {
          ...emptyStage(),
          id: "s1",
          coordinates: [-3.19, 55.95],
          highlights: [],
          lodgingUrl: null,
          meals: [{ ...meal, photoUrl: `/api/voyages/files/${photo}` }],
        },
      ],
    } as unknown as TripDetail;

    // La photo repart par son nom, sans son adresse publique.
    expect(draftToPayload(tripToDraft(detail)).stages[0].meals).toEqual([meal]);
  });

  it("place le repas grâce au GPS de sa photo", async () => {
    const photo = "8c6c3f1e-6b8a-4a51-9d55-3c2d0b7c1a11.jpg";
    const upload = vi.spyOn(adminApi, "uploadMealPhoto").mockResolvedValue({
      photo,
      photoUrl: `/api/voyages/files/${photo}`,
      coordinates: [-6.1966, 57.4125],
    });
    let meals: MealDraft[] = [];
    render(<Harness onMeals={(next) => (meals = next)} />);

    fireEvent.click(screen.getByRole("button", { name: /Ajouter un repas/ }));
    fireEvent.change(screen.getByLabelText("Lieu du repas 1"), {
      target: { value: "Scorrybreac" },
    });
    const file = new File(["jpeg"], "repas.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Photo du repas (facultatif)"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText("✓ Point GPS repris de la photo."),
    ).toBeInTheDocument();
    expect(upload).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(draftToPayload(tripWith(meals)).stages[0].meals).toEqual([
        {
          name: "Scorrybreac",
          coordinates: [-6.1966, 57.4125],
          url: null,
          photo,
        },
      ]),
    );
  });
});
