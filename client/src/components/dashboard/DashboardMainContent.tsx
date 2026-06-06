import type { Dispatch, SetStateAction } from "react";
import type { BodyMeasurement, Exercise, Meal, User, UserGoal, Workout } from "../../api/client";
import type { BodyMeasurementsState } from "../../stores/bodyMeasurementsStore";
import type { ExercisesState } from "../../stores/exercisesStore";
import type { FoodsState } from "../../stores/foodsStore";
import type { MealsState } from "../../stores/mealsStore";
import type { NutritionGoalsState } from "../../stores/nutritionGoalsStore";
import type { UserGoalsState } from "../../stores/userGoalsStore";
import type { WorkoutTemplatesState } from "../../stores/workoutTemplatesStore";
import type { WorkoutsState } from "../../stores/workoutsStore";
import { DashboardOverview } from "../DashboardOverview";
import { WorkoutsCalendar } from "../WorkoutsCalendar";
import { DashboardExercisesSection } from "./DashboardExercisesSection";
import { DashboardGoalsSection } from "./DashboardGoalsSection";
import { DashboardMealsSection } from "./DashboardMealsSection";
import { DashboardMeasurementsSection } from "./DashboardMeasurementsSection";
import { DashboardWorkoutsSection } from "./DashboardWorkoutsSection";
import { FoodsList } from "./FoodsList";
import { duplicateMealInput } from "./MealForm";
import { openCreate, type ModalState } from "./modalState";
import { NutritionGoalsList } from "./NutritionGoalsList";
import { ProfileForm } from "./ProfileForm";
import { ResourceHeader, type DashboardResource } from "./ResourceHeader";
import { ErrorBox } from "./shared";

type DashboardMainContentProps = {
  activeError: string | null;
  bodyMeasurementDraft: BodyMeasurement | undefined;
  bodyMeasurementsStore: BodyMeasurementsState;
  contentClass: string;
  exerciseDraft: Exercise | undefined;
  exercisesStore: ExercisesState;
  foodsStore: FoodsState;
  formatDate: (value: string) => string;
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  goalsStore: NutritionGoalsState;
  isLoading: boolean;
  isProfileSaving: boolean;
  mealDraft: Meal | undefined;
  mealsStore: MealsState;
  mealsView: "list" | "create";
  onUpdateProfile: (data: Partial<Pick<User, "email" | "dateOfBirth">> & {
    password?: string;
    currentPassword?: string;
  }) => Promise<void>;
  profileError: string | null;
  resource: DashboardResource;
  setBodyMeasurementDraft: Dispatch<SetStateAction<BodyMeasurement | undefined>>;
  setExerciseDraft: Dispatch<SetStateAction<Exercise | undefined>>;
  setMealDraft: Dispatch<SetStateAction<Meal | undefined>>;
  setMealsView: Dispatch<SetStateAction<"list" | "create">>;
  setModal: Dispatch<SetStateAction<ModalState>>;
  setResource: Dispatch<SetStateAction<DashboardResource>>;
  setUserGoalDraft: Dispatch<SetStateAction<UserGoal | undefined>>;
  setWorkoutDraft: Dispatch<SetStateAction<Workout | undefined>>;
  setWorkoutPrefillDraft: Dispatch<SetStateAction<Workout | undefined>>;
  setWorkoutPresetDate: Dispatch<SetStateAction<string | undefined>>;
  setWorkoutsView: Dispatch<SetStateAction<"list" | "create" | "from-template">>;
  userDateOfBirth: string | null;
  userEmail: string;
  userGoalDraft: UserGoal | undefined;
  userGoalsStore: UserGoalsState;
  userName: string;
  workoutDraft: Workout | undefined;
  workoutPrefillDraft: Workout | undefined;
  workoutPresetDate: string | undefined;
  workoutsStore: WorkoutsState;
  workoutsView: "list" | "create" | "from-template";
  workoutTemplatesStore: WorkoutTemplatesState;
};

function confirmDelete(label: string, action: () => Promise<void>) {
  if (window.confirm(`Supprimer "${label}" ?`)) {
    void action();
  }
}

export function DashboardMainContent({
  activeError,
  bodyMeasurementDraft,
  bodyMeasurementsStore,
  contentClass,
  exerciseDraft,
  exercisesStore,
  foodsStore,
  formatDate,
  getExerciseImageUrl,
  goalsStore,
  isLoading,
  isProfileSaving,
  mealDraft,
  mealsStore,
  mealsView,
  onUpdateProfile,
  profileError,
  resource,
  setBodyMeasurementDraft,
  setExerciseDraft,
  setMealDraft,
  setMealsView,
  setModal,
  setResource,
  setUserGoalDraft,
  setWorkoutDraft,
  setWorkoutPrefillDraft,
  setWorkoutPresetDate,
  setWorkoutsView,
  userDateOfBirth,
  userEmail,
  userGoalDraft,
  userGoalsStore,
  userName,
  workoutDraft,
  workoutPrefillDraft,
  workoutPresetDate,
  workoutsStore,
  workoutsView,
  workoutTemplatesStore,
}: DashboardMainContentProps) {
  return (
    <div className={contentClass}>
      {resource !== "dashboard" && resource !== "calendar" && resource !== "profile" && (
        <ResourceHeader
          resource={resource}
          onCreate={() => {
            if (resource === "workouts") {
              setWorkoutDraft(undefined);
              setWorkoutPrefillDraft(undefined);
              setWorkoutPresetDate(undefined);
              setWorkoutsView("create");
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
  );
}
