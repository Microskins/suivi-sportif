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
import { BodyMeasurementForm } from "./dashboard/BodyMeasurementForm";
import { BodyMeasurementsList } from "./dashboard/BodyMeasurementsList";
import { DashboardModalContent } from "./dashboard/DashboardModalContent";
import { ExerciseForm } from "./dashboard/ExerciseForm";
import { ExercisesList } from "./dashboard/ExercisesList";
import { FoodsList } from "./dashboard/FoodsList";
import { duplicateMealInput, MealForm } from "./dashboard/MealForm";
import { MealsList } from "./dashboard/MealsList";
import { Modal } from "./dashboard/Modal";
import { modalTitle, type ModalState, openCreate } from "./dashboard/modalState";
import { NutritionDayPanel } from "./dashboard/NutritionDayPanel";
import { NutritionGoalsList } from "./dashboard/NutritionGoalsList";
import { ProfileForm } from "./dashboard/ProfileForm";
import { DashboardNav } from "./dashboard/DashboardNav";
import { DashboardTopBar } from "./dashboard/DashboardTopBar";
import { ResourceHeader, type DashboardResource } from "./dashboard/ResourceHeader";
import { SportProgressionPanel } from "./dashboard/SportProgressionPanel";
import { UserGoalsPanel } from "./dashboard/UserGoalsPanel";
import { WorkoutForm } from "./dashboard/WorkoutForm";
import { WorkoutTemplatePicker } from "./dashboard/WorkoutTemplatePicker";
import { WorkoutsList } from "./dashboard/WorkoutsList";
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
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={workoutsView === "list" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutsView("list"); setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); }}>Liste</button>
                    <button type="button" className={workoutsView === "create" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutsView("create"); setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); }}>Creer une seance</button>
                    <button type="button" className={workoutsView === "from-template" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); setWorkoutsView("from-template"); }}>Depuis un modele</button>
                  </div>
                  {workoutsView === "list" && (
                    <WorkoutsList
                      workouts={workoutsStore.workouts}
                      onEdit={(item) => {
                        setWorkoutDraft(item);
                        setWorkoutPrefillDraft(undefined);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("create");
                      }}
                      onDuplicate={(item) => {
                        setWorkoutDraft(undefined);
                        setWorkoutPrefillDraft(item);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("create");
                      }}
                      onDelete={(item) => confirmDelete(item.name, () => workoutsStore.deleteWorkout(item.id))}
                    />
                  )}
                  {workoutsView === "create" && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <WorkoutForm
                        item={workoutDraft}
                        prefillWorkout={workoutPrefillDraft}
                        initialDate={workoutPresetDate}
                        exercises={exercisesStore.exercises}
                        getExerciseImageUrl={getExerciseImageUrl}
                        onCancel={() => {
                          setWorkoutDraft(undefined);
                          setWorkoutPrefillDraft(undefined);
                          setWorkoutPresetDate(undefined);
                          setWorkoutsView("list");
                        }}
                        onSubmit={(data) =>
                          workoutDraft
                            ? workoutsStore.updateWorkout(workoutDraft.id, data)
                            : workoutsStore.createWorkout(data)
                        }
                      />
                    </div>
                  )}
                  {workoutsView === "from-template" && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <WorkoutTemplatePicker
                        templates={workoutTemplatesStore.workoutTemplates}
                        exercises={exercisesStore.exercises}
                        onCancel={() => setWorkoutsView("list")}
                        onInstantiate={(id, date) =>
                          workoutTemplatesStore.instantiateWorkoutTemplate(id, date)
                        }
                        onCreateTemplate={(data) =>
                          workoutTemplatesStore.createWorkoutTemplate(data)
                        }
                        onUpdateTemplate={(id, data) =>
                          workoutTemplatesStore.updateWorkoutTemplate(id, data)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {resource === "sportGoals" && (
                <div className="space-y-4">
                  <SportProgressionPanel
                    exercises={exercisesStore.exercises}
                    workouts={workoutsStore.workouts}
                    goals={userGoalsStore.userGoals}
                  />
                  <UserGoalsPanel
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
                </div>
              )}
              {resource === "exercises" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={exerciseDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setExerciseDraft(undefined)}>Liste</button>
                    <button type="button" className={exerciseDraft !== undefined && !exerciseDraft.id ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setExerciseDraft({} as Exercise)}>Creer un exercice</button>
                  </div>
                  {exerciseDraft !== undefined ? (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <ExerciseForm
                        item={exerciseDraft.id ? exerciseDraft : undefined}
                        onCancel={() => setExerciseDraft(undefined)}
                        onSubmit={(data) =>
                          exerciseDraft.id
                            ? exercisesStore.updateExercise(exerciseDraft.id, data)
                            : exercisesStore.createExercise(data)
                        }
                      />
                    </div>
                  ) : (
                    <ExercisesList
                      exercises={exercisesStore.exercises}
                      getExerciseImageUrl={getExerciseImageUrl}
                      onEdit={(item) => setExerciseDraft(item)}
                      onDelete={(item) => confirmDelete(item.name, () => exercisesStore.deleteExercise(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "foods" && (
                <FoodsList
                  foods={foodsStore.foods}
                  onEdit={(item) => setModal({ type: "food", item })}
                  onDelete={(item) => confirmDelete(item.name, () => foodsStore.deleteFood(item.id))}
                />
              )}
              {resource === "meals" && (
                <div className="space-y-4">
                  <NutritionDayPanel
                    meals={mealsStore.meals}
                    goals={goalsStore.nutritionGoals}
                  />
                  <div className="flex flex-wrap gap-2 rounded border border-amber-200 bg-amber-50/60 p-2">
                    <button
                      type="button"
                      className={mealsView === "list" ? activeViewButtonClass : inactiveViewButtonClass}
                      onClick={() => {
                        setMealsView("list");
                        setMealDraft(undefined);
                      }}
                    >
                      Liste
                    </button>
                    <button
                      type="button"
                      className={mealsView === "create" ? activeViewButtonClass : inactiveViewButtonClass}
                      onClick={() => {
                        setMealsView("create");
                        setMealDraft(undefined);
                      }}
                    >
                      Creer un repas
                    </button>
                  </div>
                  {mealsView === "create" ? (
                    <div className="rounded border border-amber-200 bg-white p-4">
                      <MealForm
                        item={mealDraft}
                        foods={foodsStore.foods}
                        meals={mealsStore.meals}
                        nutritionGoals={goalsStore.nutritionGoals}
                        onCancel={() => {
                          setMealDraft(undefined);
                          setMealsView("list");
                        }}
                        onSubmit={(data) =>
                          mealDraft
                            ? mealsStore.updateMeal(mealDraft.id, data, foodsStore.foods)
                            : mealsStore.createMeal(data, foodsStore.foods)
                        }
                      />
                    </div>
                  ) : (
                    <MealsList
                      meals={mealsStore.meals}
                      onEdit={(item) => {
                        setMealDraft(item);
                        setMealsView("create");
                      }}
                      onDuplicate={(item) => {
                        const copy = duplicateMealInput(item);
                        if (copy) {
                          void mealsStore.createMeal(copy, foodsStore.foods);
                        }
                      }}
                      onDelete={(item) => confirmDelete(item.name, () => mealsStore.deleteMeal(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "goals" && (
                <NutritionGoalsList
                  goals={goalsStore.nutritionGoals}
                  onEdit={(item) => setModal({ type: "goal", item })}
                  onDelete={(item) => confirmDelete(item.name, () => goalsStore.deleteNutritionGoal(item.id))}
                />
              )}
              {resource === "measurements" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={bodyMeasurementDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setBodyMeasurementDraft(undefined)}>Historique</button>
                    <button type="button" className={bodyMeasurementDraft !== undefined && !bodyMeasurementDraft.id ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setBodyMeasurementDraft({} as BodyMeasurement)}>Ajouter une mesure</button>
                  </div>
                  {bodyMeasurementDraft !== undefined ? (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <BodyMeasurementForm
                        item={bodyMeasurementDraft.id ? bodyMeasurementDraft : undefined}
                        onCancel={() => setBodyMeasurementDraft(undefined)}
                        onSubmit={(data) =>
                          bodyMeasurementDraft.id
                            ? bodyMeasurementsStore.updateBodyMeasurement(bodyMeasurementDraft.id, data)
                            : bodyMeasurementsStore.createBodyMeasurement(data)
                        }
                      />
                    </div>
                  ) : (
                    <BodyMeasurementsList
                      measurements={bodyMeasurementsStore.bodyMeasurements}
                      userDateOfBirth={userDateOfBirth}
                      formatDate={formatDate}
                      onEdit={(item) => setBodyMeasurementDraft(item)}
                      onDelete={(item) => confirmDelete(formatDate(item.date), () => bodyMeasurementsStore.deleteBodyMeasurement(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "bodyGoals" && (
                <UserGoalsPanel
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
