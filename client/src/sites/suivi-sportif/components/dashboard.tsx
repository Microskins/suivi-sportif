import { useEffect, useMemo, useState } from "react";
import type {
  AssistantDraft,
  BodyMeasurement,
  Exercise,
  Meal,
  UserGoal,
  Workout,
  User,
} from "../api/client";
import { DashboardMainContent } from "./dashboard/dashboard-main-content";
import { DashboardModalContent } from "./dashboard/dashboard-modal-content";
import { Modal } from "./dashboard/modal";
import { modalTitle, type ModalState } from "./dashboard/modal-state";
import { DashboardNav } from "./dashboard/dashboard-nav";
import { DashboardTopBar } from "./dashboard/dashboard-top-bar";
import { AssistantChatbox } from "./dashboard/assistant-chatbox";
import {
  buildExerciseImageUrl,
  formatDate,
  normalizeExerciseKey,
  repairMojibake,
  requireString,
  toBodyMeasurementInput,
  toExerciseInput,
  toFoodInput,
  toMealInput,
  toUserGoalInput,
  toWorkoutInput,
  type ExerciseCatalogEntry,
} from "./dashboard/dashboard-helpers";
import type { DashboardResource } from "./dashboard/resource-header";
import { labelFromOptions } from "./dashboard/workout-form-utils";
import { useBodyMeasurementsStore } from "../stores/body-measurements-store";
import { useExercisesStore } from "../stores/exercises-store";
import { useFoodsStore } from "../stores/foods-store";
import { useMealsStore } from "../stores/meals-store";
import { useNutritionGoalsStore } from "../stores/nutrition-goals-store";
import { useUserGoalsStore } from "../stores/user-goals-store";
import { useWorkoutTemplatesStore } from "../stores/workout-templates-store";
import { useWorkoutsStore } from "../stores/workouts-store";

type Resource = DashboardResource;

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
        "/sites/suivi-sportif/exercises/exercices.json",
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
      : "panel min-w-0 p-5 sm:p-6";

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
    <main className="site-sport-grid min-h-screen text-[#2b241e]">
      <section className="min-h-screen md:pl-[230px]">
        <aside className="border-b border-[#f0e3d6] bg-white p-4 md:fixed md:inset-y-0 md:left-0 md:z-10 md:w-[230px] md:overflow-y-auto md:border-b-0 md:border-r md:p-5">
          <DashboardTopBar
            userName={userName}
            userEmail={userEmail}
            isAuthBypassEnabled={isAuthBypassEnabled}
            onLogout={onLogout}
          />
          <DashboardNav
            resource={resource}
            onSelect={(nextResource) => {
              if (nextResource === "sportGoals" || nextResource === "bodyGoals") {
                setUserGoalDraft(undefined);
              }
              setResource(nextResource);
            }}
          />
        </aside>

        <div className="min-w-0 p-4 sm:p-6 md:p-8 xl:p-10">
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
