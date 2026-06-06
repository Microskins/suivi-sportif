import type { Exercise } from "../../api/client";
import { difficultyOptions, exerciseTypeOptions } from "./workoutFormUtils";
import { inputClass, secondaryButtonClass } from "./shared";

type ExerciseTypeFilter = "ALL" | "STRENGTH" | "CARDIO" | "MOBILITY";
type ExerciseDifficultyFilter = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export function WorkoutExerciseFilters({
  exercises,
  filteredExercisesCount,
  exerciseSearch,
  exerciseTypeFilter,
  exerciseDifficultyFilter,
  exerciseBodyPartFilter,
  bodyPartOptions,
  onExerciseSearchChange,
  onExerciseTypeFilterChange,
  onExerciseDifficultyFilterChange,
  onExerciseBodyPartFilterChange,
}: {
  exercises: Exercise[];
  filteredExercisesCount: number;
  exerciseSearch: string;
  exerciseTypeFilter: ExerciseTypeFilter;
  exerciseDifficultyFilter: ExerciseDifficultyFilter;
  exerciseBodyPartFilter: string;
  bodyPartOptions: string[];
  onExerciseSearchChange: (value: string) => void;
  onExerciseTypeFilterChange: (value: ExerciseTypeFilter) => void;
  onExerciseDifficultyFilterChange: (value: ExerciseDifficultyFilter) => void;
  onExerciseBodyPartFilterChange: (value: string) => void;
}) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Filtres exercices</p>
          <p className="mt-1 text-xs text-slate-500">
            {filteredExercisesCount} / {exercises.length} exercice(s) visible(s)
          </p>
        </div>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            onExerciseSearchChange("");
            onExerciseTypeFilterChange("ALL");
            onExerciseDifficultyFilterChange("ALL");
            onExerciseBodyPartFilterChange("ALL");
          }}
        >
          Reinitialiser
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <input
          className={inputClass}
          value={exerciseSearch}
          onChange={(event) => onExerciseSearchChange(event.target.value)}
          placeholder="Rechercher..."
        />
        <select
          className={inputClass}
          value={exerciseTypeFilter}
          onChange={(event) =>
            onExerciseTypeFilterChange(event.target.value as ExerciseTypeFilter)
          }
        >
          <option value="ALL">Tous les types</option>
          {exerciseTypeOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className={inputClass}
          value={exerciseDifficultyFilter}
          onChange={(event) =>
            onExerciseDifficultyFilterChange(event.target.value as ExerciseDifficultyFilter)
          }
        >
          <option value="ALL">Toutes difficultes</option>
          {difficultyOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className={inputClass}
          value={exerciseBodyPartFilter}
          onChange={(event) => onExerciseBodyPartFilterChange(event.target.value)}
        >
          <option value="ALL">Toutes parties</option>
          {bodyPartOptions.map((part) => (
            <option key={part} value={part}>{part}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
