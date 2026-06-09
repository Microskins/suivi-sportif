import { useEffect, useMemo, useState } from "react";
import type {
  AssistantDraft,
  BodyMeasurementInput,
  BodyMeasurement,
  Exercise,
  ExerciseInput,
  FoodInput,
  MealInput,
  Meal,
  UserGoalInput,
  UserGoal,
  WorkoutInput,
  Workout,
  User,
} from "../api/client";
import { DashboardMainContent } from "./dashboard/DashboardMainContent";
import { DashboardModalContent } from "./dashboard/DashboardModalContent";
import { Modal } from "./dashboard/Modal";
import { modalTitle, type ModalState } from "./dashboard/modalState";
import { DashboardNav } from "./dashboard/DashboardNav";
import { DashboardTopBar } from "./dashboard/DashboardTopBar";
import { AssistantChatbox } from "./dashboard/AssistantChatbox";
import type { DashboardResource } from "./dashboard/ResourceHeader";
import { labelFromOptions } from "./dashboard/workoutFormUtils";
import { useBodyMeasurementsStore } from "../stores/bodyMeasurementsStore";
import { useExercisesStore } from "../stores/exercisesStore";
import { useFoodsStore } from "../stores/foodsStore";
import { useMealsStore } from "../stores/mealsStore";
import { useNutritionGoalsStore } from "../stores/nutritionGoalsStore";
import { useUserGoalsStore } from "../stores/userGoalsStore";
import { useWorkoutTemplatesStore } from "../stores/workoutTemplatesStore";
import { useWorkoutsStore } from "../stores/workoutsStore";

type Resource = DashboardResource;

type ExerciseCatalogEntry = {
  nom: string;
  image: string;
};

function repairMojibake(value: string) {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function normalizeExerciseKey(value: string) {
  return repairMojibake(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildExerciseImageUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const sanitized = path.replace(/^\/+/, "");
  if (sanitized.startsWith("exercices-assets/")) {
    return `/${sanitized}`;
  }
  if (sanitized.startsWith("images/")) {
    return `/exercices-assets/${sanitized}`;
  }
  return `/exercices-assets/images/${sanitized}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Champ assistant invalide: ${label}`);
  }

  return value;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function requireNumber(value: unknown, label: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Champ assistant invalide: ${label}`);
  }

  return value;
}

function toMealInput(payload: Record<string, unknown>): MealInput {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Item de repas assistant invalide");
    }
    const entry = item as Record<string, unknown>;
    return {
      foodId: requireString(entry.foodId, "foodId"),
      quantityGrams: requireNumber(entry.quantityGrams, "quantityGrams"),
    };
  });

  if (items.length === 0) {
    throw new Error("Le brouillon repas doit contenir au moins un aliment.");
  }

  return {
    date: requireString(payload.date, "date"),
    items,
    mealType:
      typeof payload.mealType === "string"
        ? (payload.mealType as MealInput["mealType"])
        : "other",
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
  };
}

function toFoodInput(payload: Record<string, unknown>): FoodInput {
  return {
    barcode: optionalString(payload.barcode),
    brand: optionalString(payload.brand),
    caloriesKcal: requireNumber(payload.caloriesKcal, "caloriesKcal"),
    carbsGrams: requireNumber(payload.carbsGrams, "carbsGrams"),
    fatGrams: requireNumber(payload.fatGrams, "fatGrams"),
    fiberGrams:
      typeof payload.fiberGrams === "number" ? payload.fiberGrams : null,
    name: requireString(payload.name, "name"),
    proteinGrams: requireNumber(payload.proteinGrams, "proteinGrams"),
    servingUnit:
      payload.servingUnit === "unit" || payload.servingUnit === "g"
        ? payload.servingUnit
        : "g",
  };
}

function toExerciseInput(payload: Record<string, unknown>): ExerciseInput {
  return {
    bodyParts: Array.isArray(payload.bodyParts)
      ? payload.bodyParts.filter(
          (part): part is string => typeof part === "string" && part.length > 0,
        )
      : undefined,
    description: optionalString(payload.description),
    difficulty:
      payload.difficulty === "INTERMEDIATE" || payload.difficulty === "ADVANCED"
        ? payload.difficulty
        : "BEGINNER",
    exerciseType:
      payload.exerciseType === "CARDIO" || payload.exerciseType === "MOBILITY"
        ? payload.exerciseType
        : "STRENGTH",
    name: requireString(payload.name, "name"),
  };
}

function toBodyMeasurementInput(
  payload: Record<string, unknown>,
): BodyMeasurementInput {
  return {
    date: requireString(payload.date, "date"),
    weightKg:
      typeof payload.weightKg === "number" ? payload.weightKg : undefined,
    notes: optionalString(payload.notes),
  };
}

function toWorkoutInput(payload: Record<string, unknown>): WorkoutInput {
  const rawExercises = Array.isArray(payload.exercises) ? payload.exercises : [];
  const exercises = rawExercises.map((exercise) => {
    if (!exercise || typeof exercise !== "object") {
      throw new Error("Exercice assistant invalide");
    }
    const entry = exercise as Record<string, unknown>;
    const rawSets = Array.isArray(entry.sets) ? entry.sets : [];
    return {
      exerciseId: requireString(entry.exerciseId, "exerciseId"),
      sets: rawSets.map((set) => {
        if (!set || typeof set !== "object") {
          throw new Error("Serie assistant invalide");
        }
        const setEntry = set as Record<string, unknown>;
        return {
          reps: typeof setEntry.reps === "number" ? setEntry.reps : undefined,
          rest: typeof setEntry.rest === "number" ? setEntry.rest : 90,
          weight:
            typeof setEntry.weight === "number" ? setEntry.weight : undefined,
        };
      }),
    };
  });

  return {
    date: requireString(payload.date, "date"),
    duration:
      typeof payload.duration === "number" ? payload.duration : 60,
    exercises: exercises.length > 0 ? exercises : undefined,
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
    status:
      typeof payload.status === "string"
        ? (payload.status as WorkoutInput["status"])
        : undefined,
  };
}

function toUserGoalInput(payload: Record<string, unknown>): UserGoalInput {
  return {
    direction:
      typeof payload.direction === "string"
        ? (payload.direction as UserGoalInput["direction"])
        : "AT_MOST",
    domain: requireString(payload.domain, "domain") as UserGoalInput["domain"],
    endDate: optionalString(payload.endDate),
    exerciseId: optionalString(payload.exerciseId),
    isActive:
      typeof payload.isActive === "boolean" ? payload.isActive : true,
    metric: requireString(payload.metric, "metric") as UserGoalInput["metric"],
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
    startDate: requireString(payload.startDate, "startDate"),
    targetValue: requireNumber(payload.targetValue, "targetValue"),
  };
}

export function Dashboard({
  userName,
  userEmail,
  userDateOfBirth,
  onUpdateProfile,
  onLogout,
  isProfileSaving,
  profileError,
  isAuthBypassEnabled,
}: {
  userName: string;
  userEmail: string;
  userDateOfBirth: string | null;
  onUpdateProfile: (data: Partial<Pick<User, "email" | "dateOfBirth">> & {
    password?: string;
    currentPassword?: string;
  }) => Promise<void>;
  onLogout: () => void;
  isProfileSaving: boolean;
  profileError: string | null;
  isAuthBypassEnabled: boolean;
}) {
  const [resource, setResource] = useState<Resource>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);
  const [workoutsView, setWorkoutsView] = useState<"list" | "create" | "from-template">("list");
  const [exerciseDraft, setExerciseDraft] = useState<Exercise | undefined>(undefined);
  const [bodyMeasurementDraft, setBodyMeasurementDraft] = useState<BodyMeasurement | undefined>(undefined);
  const [userGoalDraft, setUserGoalDraft] = useState<UserGoal | undefined>(undefined);
  const [workoutDraft, setWorkoutDraft] = useState<Workout | undefined>(undefined);
  const [workoutPrefillDraft, setWorkoutPrefillDraft] = useState<Workout | undefined>(undefined);
  const [workoutPresetDate, setWorkoutPresetDate] = useState<string | undefined>(undefined);
  const [mealsView, setMealsView] = useState<"list" | "create">("list");
  const [mealDraft, setMealDraft] = useState<Meal | undefined>(undefined);
  const bodyMeasurementsStore = useBodyMeasurementsStore();
  const exercisesStore = useExercisesStore();
  const workoutsStore = useWorkoutsStore();
  const workoutTemplatesStore = useWorkoutTemplatesStore();
  const foodsStore = useFoodsStore();
  const mealsStore = useMealsStore();
  const goalsStore = useNutritionGoalsStore();
  const userGoalsStore = useUserGoalsStore();
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogEntry[]>([]);

  const exerciseImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of exerciseCatalog) {
      const rawKey = normalizeExerciseKey(entry.nom);
      map.set(rawKey, entry.image);
      const repairedKey = normalizeExerciseKey(repairMojibake(entry.nom));
      map.set(repairedKey, entry.image);
    }
    return map;
  }, [exerciseCatalog]);

  const getExerciseImageUrl = (exercise: Exercise | undefined) => {
    if (!exercise) return null;
    const imagePath = exerciseImageMap.get(normalizeExerciseKey(exercise.name));
    return buildExerciseImageUrl(imagePath ?? null);
  };

  useEffect(() => {
    void exercisesStore.fetchExercises();
    void workoutsStore.fetchWorkouts();
    void workoutTemplatesStore.fetchWorkoutTemplates();
    void foodsStore.fetchFoods();
    void mealsStore.fetchMeals();
    void goalsStore.fetchNutritionGoals();
    void userGoalsStore.fetchUserGoals();
    void bodyMeasurementsStore.fetchBodyMeasurements();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadExerciseCatalog() {
      const candidateUrls = [
        "/exercices-assets/exercices.json",
        "/exercices.json",
        "/exercices/exercices.json",
      ];
      try {
        for (const url of candidateUrls) {
          const response = await fetch(url);
          if (!response.ok) {
            continue;
          }
          const data = (await response.json()) as ExerciseCatalogEntry[];
          if (!isCancelled && Array.isArray(data)) {
            setExerciseCatalog(
              data.filter(
                (entry) =>
                  typeof entry?.nom === "string" && typeof entry?.image === "string",
              ),
            );
          }
          return;
        }
        if (!isCancelled) {
          setExerciseCatalog([]);
        }
      } catch {
        if (!isCancelled) {
          setExerciseCatalog([]);
        }
      }
    }

    void loadExerciseCatalog();
    return () => {
      isCancelled = true;
    };
  }, []);

  const isLoading =
    exercisesStore.isLoading ||
    workoutsStore.isLoading ||
    workoutTemplatesStore.isLoading ||
    foodsStore.isLoading ||
    mealsStore.isLoading ||
    goalsStore.isLoading ||
    userGoalsStore.isLoading ||
    bodyMeasurementsStore.isLoading;

  const activeError =
    resource === "dashboard" || resource === "calendar"
      ? null
      : resource === "workouts"
      ? workoutsStore.error ?? workoutTemplatesStore.error
      : resource === "sportGoals"
        ? userGoalsStore.error
      : resource === "exercises"
        ? exercisesStore.error
        : resource === "foods"
          ? foodsStore.error
        : resource === "meals"
          ? mealsStore.error
          : resource === "goals"
            ? goalsStore.error
            : resource === "measurements"
              ? bodyMeasurementsStore.error
              : resource === "bodyGoals"
                ? userGoalsStore.error
              : null;

  const contentClass =
    resource === "dashboard" || resource === "calendar"
      ? "min-w-0"
      : "rounded border border-neutral-200 bg-white p-5 shadow-sm";

  async function applyAssistantDraft(draft: AssistantDraft) {
    if (draft.missingFields.length > 0) {
      throw new Error("Le brouillon contient encore des champs a completer.");
    }

    if (draft.action === "create_meal") {
      await mealsStore.createMeal(toMealInput(draft.payload), foodsStore.foods);
      await mealsStore.fetchMeals();
      return;
    }

    if (draft.action === "create_food") {
      await foodsStore.createFood(toFoodInput(draft.payload));
      await foodsStore.fetchFoods();
      return;
    }

    if (draft.action === "create_exercise") {
      await exercisesStore.createExercise(toExerciseInput(draft.payload));
      await exercisesStore.fetchExercises();
      return;
    }

    if (draft.action === "update_meal") {
      const id = requireString(draft.payload.id, "id");
      await mealsStore.updateMeal(id, toMealInput(draft.payload), foodsStore.foods);
      await mealsStore.fetchMeals();
      return;
    }

    if (draft.action === "delete_meal") {
      const id = requireString(draft.payload.id, "id");
      await mealsStore.deleteMeal(id);
      await mealsStore.fetchMeals();
      return;
    }

    if (draft.action === "create_body_measurement") {
      await bodyMeasurementsStore.createBodyMeasurement(
        toBodyMeasurementInput(draft.payload),
      );
      await bodyMeasurementsStore.fetchBodyMeasurements();
      return;
    }

    if (draft.action === "update_body_measurement") {
      const id = requireString(draft.payload.id, "id");
      await bodyMeasurementsStore.updateBodyMeasurement(
        id,
        toBodyMeasurementInput(draft.payload),
      );
      await bodyMeasurementsStore.fetchBodyMeasurements();
      return;
    }

    if (draft.action === "delete_body_measurement") {
      const id = requireString(draft.payload.id, "id");
      await bodyMeasurementsStore.deleteBodyMeasurement(id);
      await bodyMeasurementsStore.fetchBodyMeasurements();
      return;
    }

    if (draft.action === "create_workout") {
      await workoutsStore.createWorkout(toWorkoutInput(draft.payload));
      await workoutsStore.fetchWorkouts();
      return;
    }

    if (draft.action === "update_workout") {
      const id = requireString(draft.payload.id, "id");
      await workoutsStore.updateWorkout(id, toWorkoutInput(draft.payload));
      await workoutsStore.fetchWorkouts();
      return;
    }

    if (draft.action === "delete_workout") {
      const id = requireString(draft.payload.id, "id");
      await workoutsStore.deleteWorkout(id);
      await workoutsStore.fetchWorkouts();
      return;
    }

    if (draft.action === "create_user_goal") {
      await userGoalsStore.createUserGoal(toUserGoalInput(draft.payload));
      await userGoalsStore.fetchUserGoals();
      return;
    }

    if (draft.action === "update_profile") {
      await onUpdateProfile(draft.payload);
      return;
    }

    throw new Error("Cette action assistant ne peut pas encore etre appliquee.");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8f5_0%,#edf4ef_48%,#f6f7f4_100%)] text-neutral-950">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <DashboardTopBar
          userName={userName}
          userEmail={userEmail}
          isAuthBypassEnabled={isAuthBypassEnabled}
          onLogout={onLogout}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-[230px_1fr]">
          <DashboardNav
            resource={resource}
            onSelect={(nextResource) => {
              if (nextResource === "sportGoals" || nextResource === "bodyGoals") {
                setUserGoalDraft(undefined);
              }
              setResource(nextResource);
            }}
          />

          <DashboardMainContent
            activeError={activeError}
            bodyMeasurementDraft={bodyMeasurementDraft}
            bodyMeasurementsStore={bodyMeasurementsStore}
            contentClass={contentClass}
            exerciseDraft={exerciseDraft}
            exercisesStore={exercisesStore}
            foodsStore={foodsStore}
            formatDate={formatDate}
            getExerciseImageUrl={getExerciseImageUrl}
            goalsStore={goalsStore}
            isLoading={isLoading}
            isProfileSaving={isProfileSaving}
            mealDraft={mealDraft}
            mealsStore={mealsStore}
            mealsView={mealsView}
            onUpdateProfile={onUpdateProfile}
            profileError={profileError}
            resource={resource}
            setBodyMeasurementDraft={setBodyMeasurementDraft}
            setExerciseDraft={setExerciseDraft}
            setMealDraft={setMealDraft}
            setMealsView={setMealsView}
            setModal={setModal}
            setResource={setResource}
            setUserGoalDraft={setUserGoalDraft}
            setWorkoutDraft={setWorkoutDraft}
            setWorkoutPrefillDraft={setWorkoutPrefillDraft}
            setWorkoutPresetDate={setWorkoutPresetDate}
            setWorkoutsView={setWorkoutsView}
            userDateOfBirth={userDateOfBirth}
            userEmail={userEmail}
            userGoalDraft={userGoalDraft}
            userGoalsStore={userGoalsStore}
            userName={userName}
            workoutDraft={workoutDraft}
            workoutPrefillDraft={workoutPrefillDraft}
            workoutPresetDate={workoutPresetDate}
            workoutsStore={workoutsStore}
            workoutsView={workoutsView}
            workoutTemplatesStore={workoutTemplatesStore}
          />
        </div>
      </section>

      {modal && (
        <Modal title={modalTitle(modal)} onClose={() => setModal(null)}>
          <DashboardModalContent
            modal={modal}
            exercises={exercisesStore.exercises}
            workoutTemplates={workoutTemplatesStore.workoutTemplates}
            getExerciseImageUrl={getExerciseImageUrl}
            onClose={() => setModal(null)}
            onCreateWorkout={(data) => workoutsStore.createWorkout(data)}
            onUpdateWorkout={(item, data) => workoutsStore.updateWorkout(item.id, data)}
            onInstantiateWorkoutTemplate={(id, date) =>
              workoutTemplatesStore.instantiateWorkoutTemplate(id, date)
            }
            onCreateWorkoutTemplate={(data) =>
              workoutTemplatesStore.createWorkoutTemplate(data)
            }
            onUpdateWorkoutTemplate={(id, data) =>
              workoutTemplatesStore.updateWorkoutTemplate(id, data)
            }
            onCreateFood={(data) => foodsStore.createFood(data)}
            onUpdateFood={(item, data) => foodsStore.updateFood(item.id, data)}
            onCreateNutritionGoal={(data) => goalsStore.createNutritionGoal(data)}
            onUpdateNutritionGoal={(item, data) => goalsStore.updateNutritionGoal(item.id, data)}
          />
        </Modal>
      )}
      <AssistantChatbox
        isAuthBypassEnabled={isAuthBypassEnabled}
        onApplyDraft={applyAssistantDraft}
        resource={resource}
      />
    </main>
  );
}
