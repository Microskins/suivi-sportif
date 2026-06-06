import type { BodyMeasurement, Exercise, UserGoal, Workout } from "../../api/client";
import { SportProgressionPanel } from "./SportProgressionPanel";
import { UserGoalsPanel } from "./UserGoalsPanel";

export function DashboardGoalsSection({
  domain,
  goals,
  exercises,
  workouts,
  measurements,
  draft,
  onCreate,
  onEdit,
  onCancel,
  onSubmit,
  onDelete,
}: {
  domain: "SPORT" | "BODY";
  goals: UserGoal[];
  exercises: Exercise[];
  workouts: Workout[];
  measurements: BodyMeasurement[];
  draft: UserGoal | undefined;
  onCreate: () => void;
  onEdit: (goal: UserGoal) => void;
  onCancel: () => void;
  onSubmit: Parameters<typeof UserGoalsPanel>[0]["onSubmit"];
  onDelete: (goal: UserGoal) => void;
}) {
  const goalsPanel = (
    <UserGoalsPanel
      domain={domain}
      goals={goals}
      exercises={exercises}
      workouts={workouts}
      measurements={measurements}
      draft={draft}
      onCreate={onCreate}
      onEdit={onEdit}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  );

  if (domain === "BODY") {
    return goalsPanel;
  }

  return (
    <div className="space-y-4">
      <SportProgressionPanel
        exercises={exercises}
        workouts={workouts}
        goals={goals}
      />
      {goalsPanel}
    </div>
  );
}
