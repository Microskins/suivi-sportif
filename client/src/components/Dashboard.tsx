import { useEffect, useMemo, useState } from "react";
import type {
  BodyMeasurement,
  Exercise,
  Meal,
  UserGoal,
  Workout,
  User,
} from "../api/client";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardMeasurementsSection } from "./dashboard/DashboardMeasurementsSection";
import { DashboardModalContent } from "./dashboard/DashboardModalContent";
import { DashboardWorkoutsSection } from "./dashboard/DashboardWorkoutsSection";
import { DashboardExercisesSection } from "./dashboard/DashboardExercisesSection";
import { DashboardGoalsSection } from "./dashboard/DashboardGoalsSection";
import { FoodsList } from "./dashboard/FoodsList";
import { DashboardMealsSection } from "./dashboard/DashboardMealsSection";
import { duplicateMealInput } from "./dashboard/MealForm";
import { Modal } from "./dashboard/Modal";
import { modalTitle, type ModalState, openCreate } from "./dashboard/modalState";
import { NutritionGoalsList } from "./dashboard/NutritionGoalsList";
import { ProfileForm } from "./dashboard/ProfileForm";
import { DashboardNav } from "./dashboard/DashboardNav";
import { DashboardTopBar } from "./dashboard/DashboardTopBar";
import { ResourceHeader, type DashboardResource } from "./dashboard/ResourceHeader";
import { labelFromOptions } from "./dashboard/workoutFormUtils";
import {
  activeViewButtonClass,
  EmptyState,
  ErrorBox,
  Field,
  inactiveViewButtonClass,
  inputClass,
  secondaryButtonClass,
} from "./dashboard/shared";
import { WorkoutsCalendar } from "./WorkoutsCalendar";
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

          <div className={contentClass}>
            {resource !== "dashboard" && resource !== "calendar" && resource !== "profile" && (
              <ResourceHeader
                resource={resource}
                onCreate={() => {
                  if (resource === "workouts") {
                    setWorkoutsView("create");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                    return;
                  }
                  if (resource === "exercises") {
                    setExerciseDraft({} as Exercise);
                    return;
                  }
                  if (resource === "measurements") {
                    setBodyMeasurementDraft({} as BodyMeasurement);
                    return;
                  }
                  if (resource === "meals") {
                    setMealDraft(undefined);
                    setMealsView("create");
                    return;
                  }
                  if (resource === "sportGoals" || resource === "bodyGoals") {
                    setUserGoalDraft({} as UserGoal);
                    return;
                  }
                  openCreate(resource, setModal);
                }}
                onCreateFromTemplate={
                  resource === "workouts"
                    ? () => {
                        setWorkoutDraft(undefined);
                        setWorkoutPrefillDraft(undefined);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("from-template");
                      }
                    : undefined
                }
                isLoading={isLoading}
              />
            )}
            <div className={resource === "dashboard" ? "space-y-4" : "mt-4 space-y-4"}>
              <ErrorBox message={activeError} />
              {resource === "dashboard" && (
                <DashboardOverview
                  workouts={workoutsStore.workouts}
                  meals={mealsStore.meals}
                  nutritionGoals={goalsStore.nutritionGoals}
                  userGoals={userGoalsStore.userGoals}
                  isLoading={isLoading}
                  onQuickAction={(action) => {
                    if (action === "workout") {
                      setResource("workouts");
                      setWorkoutDraft(undefined);
                      setWorkoutPrefillDraft(undefined);
                      setWorkoutPresetDate(undefined);
                      setWorkoutsView("create");
                    }
                    if (action === "meal") {
                      setResource("meals");
                      setMealDraft(undefined);
                      setMealsView("create");
                    }
                    if (action === "goal") {
                      setResource("sportGoals");
                      setUserGoalDraft({} as UserGoal);
                    }
                  }}
                />
              )}
              {resource === "calendar" && (
                <WorkoutsCalendar
                  workouts={workoutsStore.workouts}
                  userGoals={userGoalsStore.userGoals}
                  isLoading={isLoading}
                  onPlan={(dateIso) => {
                    setResource("workouts");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(dateIso);
                    setWorkoutsView("create");
                  }}
                  onAssociate={async (workoutId, dateIso) => {
                    await workoutsStore.updateWorkout(workoutId, { date: dateIso });
                  }}
                  onEdit={(workout) => setModal({ type: "workout", item: workout })}
                  onDuplicate={(workout) =>
                    setModal({
                      type: "workout",
                      prefillWorkout: workout,
                    })
                  }
                />
              )}
              {resource === "workouts" && (
                <DashboardWorkoutsSection
                  workoutsView={workoutsView}
                  workouts={workoutsStore.workouts}
                  workoutTemplates={workoutTemplatesStore.workoutTemplates}
                  exercises={exercisesStore.exercises}
                  workoutDraft={workoutDraft}
                  workoutPrefillDraft={workoutPrefillDraft}
                  workoutPresetDate={workoutPresetDate}
                  getExerciseImageUrl={getExerciseImageUrl}
                  onShowList={() => {
                    setWorkoutsView("list");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                  }}
                  onShowCreate={() => {
                    setWorkoutsView("create");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                  }}
                  onShowFromTemplate={() => {
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                    setWorkoutsView("from-template");
                  }}
                  onEditWorkout={(item) => {
                    setWorkoutDraft(item);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                    setWorkoutsView("create");
                  }}
                  onDuplicateWorkout={(item) => {
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(item);
                    setWorkoutPresetDate(undefined);
                    setWorkoutsView("create");
                  }}
                  onDeleteWorkout={(item) => confirmDelete(item.name, () => workoutsStore.deleteWorkout(item.id))}
                  onCancelWorkoutForm={() => {
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                    setWorkoutsView("list");
                  }}
                  onSubmitWorkout={(data) =>
                    workoutDraft
                      ? workoutsStore.updateWorkout(workoutDraft.id, data)
                      : workoutsStore.createWorkout(data)
                  }
                  onInstantiateWorkoutTemplate={(id, date) =>
                    workoutTemplatesStore.instantiateWorkoutTemplate(id, date)
                  }
                  onCreateWorkoutTemplate={(data) =>
                    workoutTemplatesStore.createWorkoutTemplate(data)
                  }
                  onUpdateWorkoutTemplate={(id, data) =>
                    workoutTemplatesStore.updateWorkoutTemplate(id, data)
                  }
                />
              )}
              {resource === "sportGoals" && (
                <DashboardGoalsSection
                  domain="SPORT"
                  goals={userGoalsStore.userGoals}
                  exercises={exercisesStore.exercises}
                  workouts={workoutsStore.workouts}
                  measurements={bodyMeasurementsStore.bodyMeasurements}
                  draft={userGoalDraft}
                  onCreate={() => setUserGoalDraft({} as UserGoal)}
                  onEdit={(goal) => setUserGoalDraft(goal)}
                  onCancel={() => setUserGoalDraft(undefined)}
                  onSubmit={(data) =>
                    userGoalDraft?.id
                      ? userGoalsStore.updateUserGoal(userGoalDraft.id, data)
                      : userGoalsStore.createUserGoal(data)
                  }
                  onDelete={(goal) => confirmDelete(goal.name, () => userGoalsStore.deleteUserGoal(goal.id))}
                />
              )}
              {resource === "exercises" && (
                <DashboardExercisesSection
                  exerciseDraft={exerciseDraft}
                  exercises={exercisesStore.exercises}
                  getExerciseImageUrl={getExerciseImageUrl}
                  onShowList={() => setExerciseDraft(undefined)}
                  onShowCreate={() => setExerciseDraft({} as Exercise)}
                  onEditExercise={(item) => setExerciseDraft(item)}
                  onDeleteExercise={(item) => confirmDelete(item.name, () => exercisesStore.deleteExercise(item.id))}
                  onCancelExerciseForm={() => setExerciseDraft(undefined)}
                  onSubmitExercise={(data) =>
                    exerciseDraft?.id
                      ? exercisesStore.updateExercise(exerciseDraft.id, data)
                      : exercisesStore.createExercise(data)
                  }
                />
              )}
              {resource === "foods" && (
                <FoodsList
                  foods={foodsStore.foods}
                  onEdit={(item) => setModal({ type: "food", item })}
                  onDelete={(item) => confirmDelete(item.name, () => foodsStore.deleteFood(item.id))}
                />
              )}
              {resource === "meals" && (
                <DashboardMealsSection
                  mealsView={mealsView}
                  mealDraft={mealDraft}
                  meals={mealsStore.meals}
                  foods={foodsStore.foods}
                  nutritionGoals={goalsStore.nutritionGoals}
                  onShowList={() => {
                    setMealsView("list");
                    setMealDraft(undefined);
                  }}
                  onShowCreate={() => {
                    setMealsView("create");
                    setMealDraft(undefined);
                  }}
                  onEditMeal={(item) => {
                    setMealDraft(item);
                    setMealsView("create");
                  }}
                  onDuplicateMeal={(item) => {
                    const copy = duplicateMealInput(item);
                    if (copy) {
                      void mealsStore.createMeal(copy, foodsStore.foods);
                    }
                  }}
                  onDeleteMeal={(item) => confirmDelete(item.name, () => mealsStore.deleteMeal(item.id))}
                  onCancelMealForm={() => {
                    setMealDraft(undefined);
                    setMealsView("list");
                  }}
                  onSubmitMeal={(data) =>
                    mealDraft
                      ? mealsStore.updateMeal(mealDraft.id, data, foodsStore.foods)
                      : mealsStore.createMeal(data, foodsStore.foods)
                  }
                />
              )}
              {resource === "goals" && (
                <NutritionGoalsList
                  goals={goalsStore.nutritionGoals}
                  onEdit={(item) => setModal({ type: "goal", item })}
                  onDelete={(item) => confirmDelete(item.name, () => goalsStore.deleteNutritionGoal(item.id))}
                />
              )}
              {resource === "measurements" && (
                <DashboardMeasurementsSection
                  bodyMeasurementDraft={bodyMeasurementDraft}
                  measurements={bodyMeasurementsStore.bodyMeasurements}
                  userDateOfBirth={userDateOfBirth}
                  formatDate={formatDate}
                  onShowHistory={() => setBodyMeasurementDraft(undefined)}
                  onShowCreate={() => setBodyMeasurementDraft({} as BodyMeasurement)}
                  onEditMeasurement={(item) => setBodyMeasurementDraft(item)}
                  onDeleteMeasurement={(item) => confirmDelete(formatDate(item.date), () => bodyMeasurementsStore.deleteBodyMeasurement(item.id))}
                  onCancelMeasurementForm={() => setBodyMeasurementDraft(undefined)}
                  onSubmitMeasurement={(data) =>
                    bodyMeasurementDraft?.id
                      ? bodyMeasurementsStore.updateBodyMeasurement(bodyMeasurementDraft.id, data)
                      : bodyMeasurementsStore.createBodyMeasurement(data)
                  }
                />
              )}
              {resource === "bodyGoals" && (
                <DashboardGoalsSection
                  domain="BODY"
                  goals={userGoalsStore.userGoals}
                  exercises={exercisesStore.exercises}
                  workouts={workoutsStore.workouts}
                  measurements={bodyMeasurementsStore.bodyMeasurements}
                  draft={userGoalDraft}
                  onCreate={() => setUserGoalDraft({} as UserGoal)}
                  onEdit={(goal) => setUserGoalDraft(goal)}
                  onCancel={() => setUserGoalDraft(undefined)}
                  onSubmit={(data) =>
                    userGoalDraft?.id
                      ? userGoalsStore.updateUserGoal(userGoalDraft.id, data)
                      : userGoalsStore.createUserGoal(data)
                  }
                  onDelete={(goal) => confirmDelete(goal.name, () => userGoalsStore.deleteUserGoal(goal.id))}
                />
              )}
              {resource === "profile" && (
                <ProfileForm
                  userName={userName}
                  userEmail={userEmail}
                  userDateOfBirth={userDateOfBirth}
                  isSaving={isProfileSaving}
                  error={profileError}
                  onSubmit={onUpdateProfile}
                />
              )}
            </div>
          </div>
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

function confirmDelete(label: string, action: () => Promise<void>) {
  if (window.confirm(`Supprimer "${label}" ?`)) {
    void action();
  }
}
