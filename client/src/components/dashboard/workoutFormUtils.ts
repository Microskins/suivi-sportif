import type { WorkoutStatus } from "../../api/client";

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
