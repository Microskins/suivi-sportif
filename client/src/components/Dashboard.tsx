import { useEffect, useMemo, useState } from "react";
import type {
  BodyMeasurement,
  Exercise,
  Meal,
  UserGoal,
  Workout,
  User,
} from "../api/client";
import { DashboardMainContent } from "./dashboard/DashboardMainContent";
import { DashboardModalContent } from "./dashboard/DashboardModalContent";
import { Modal } from "./dashboard/Modal";
import { modalTitle, type ModalState } from "./dashboard/modalState";
import { DashboardNav } from "./dashboard/DashboardNav";
import { DashboardTopBar } from "./dashboard/DashboardTopBar";
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
    </main>
  );
}
