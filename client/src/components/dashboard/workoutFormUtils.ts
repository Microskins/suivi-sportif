import type { Exercise, WorkoutStatus } from "../../api/client";

export const difficultyOptions = [
  ["BEGINNER", "Debutant"],
  ["INTERMEDIATE", "Intermediaire"],
  ["ADVANCED", "Avance"],
] as const;

export const exerciseTypeOptions = [
  ["STRENGTH", "Musculation"],
  ["CARDIO", "Cardio"],
  ["MOBILITY", "Mobilite"],
] as const;

export const workoutStatusOptions: Array<[WorkoutStatus, string]> = [
  ["PLANNED", "Prevue"],
  ["COMPLETED", "Realisee"],
  ["CANCELED", "Annulee"],
];

export type WorkoutExerciseFormRow = {
  exerciseId: string;
  sets: Array<{
    reps: string;
    weight: string;
    rest: string;
    durationMinutes: string;
    avgKmh: string;
    inclinePercent: string;
    rpe: string;
    rir: string;
  }>;
};

export function recommendedRestSecondsForExercise(exercise: Exercise | undefined) {
  if (!exercise) return 60;

  if (exercise.exerciseType === "CARDIO") return 60;
  if (exercise.exerciseType === "MOBILITY") return 45;

  const bodyParts = exercise.bodyParts.map((part) => part.toLocaleLowerCase("fr-FR"));
  const isCoreExercise = bodyParts.some((part) =>
    part.includes("abdo") || part.includes("gainage"),
  );
  if (isCoreExercise) return 45;

  if (exercise.difficulty === "ADVANCED") return 120;
  if (exercise.difficulty === "INTERMEDIATE") return 90;
  return 60;
}

export function recommendedRestLabel(seconds: number) {
  return `${seconds} sec conseillees`;
}

export function tutorialSearchUrl(exercise: Exercise | undefined) {
  const query = exercise
    ? `${exercise.name} exercice tutoriel`
    : "exercice tutoriel";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function toInputDateTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export function dateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

export function inferWorkoutStatusFromDate(value: string): WorkoutStatus {
  return new Date(value).getTime() > Date.now() ? "PLANNED" : "COMPLETED";
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function labelFromOptions<T extends string>(
  options: readonly (readonly [T, string])[],
  value: string,
) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

export function updateSet(
  row: WorkoutExerciseFormRow,
  rowIndex: number,
  setIndex: number,
  key:
    | "reps"
    | "weight"
    | "rest"
    | "durationMinutes"
    | "avgKmh"
    | "inclinePercent"
    | "rpe"
    | "rir",
  value: string,
  updateRow: (index: number, nextRow: WorkoutExerciseFormRow) => void,
) {
  updateRow(rowIndex, {
    ...row,
    sets: row.sets.map((set, index) => (index === setIndex ? { ...set, [key]: value } : set)),
  });
}
