import { useState } from "react";
import type { Exercise } from "../../api/client";
import {
  EmptyState,
  ExerciseImagePreview,
  inputClass,
  ItemActions,
  itemCardClass,
  secondaryButtonClass,
} from "./shared";

type ExercisesListProps = {
  exercises: Exercise[];
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onEdit: (item: Exercise) => void;
  onDelete: (item: Exercise) => void;
};

const difficultyOptions = [
  ["BEGINNER", "Debutant"],
  ["INTERMEDIATE", "Intermediaire"],
  ["ADVANCED", "Avance"],
] as const;

const exerciseTypeOptions = [
  ["STRENGTH", "Musculation"],
  ["CARDIO", "Cardio"],
  ["MOBILITY", "Mobilite"],
] as const;

function labelFromOptions<T extends string>(
  options: readonly (readonly [T, string])[],
  value: T,
) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

export function ExercisesList({
  exercises,
  getExerciseImageUrl,
  onEdit,
  onDelete,
}: ExercisesListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO" | "MOBILITY">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");
  const [bodyPartFilter, setBodyPartFilter] = useState("ALL");
  const bodyPartOptions = Array.from(
    new Set(exercises.flatMap((exercise) => exercise.bodyParts ?? [])),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  if (!exercises.length) {
    return <EmptyState label="Aucun exercice disponible. Cree un exercice pour composer tes seances." />;
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("fr-FR");
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.name.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ||
      (exercise.description?.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ?? false);
    const matchesType = typeFilter === "ALL" || exercise.exerciseType === typeFilter;
    const matchesDifficulty =
      difficultyFilter === "ALL" || exercise.difficulty === difficultyFilter;
    const matchesBodyPart =
      bodyPartFilter === "ALL" || (exercise.bodyParts ?? []).includes(bodyPartFilter);

    return matchesSearch && matchesType && matchesDifficulty && matchesBodyPart;
  });

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un exercice..."
          />
          <select
            className={inputClass}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as "ALL" | "STRENGTH" | "CARDIO" | "MOBILITY",
              )
            }
          >
            <option value="ALL">Tous les types</option>
            {exerciseTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={difficultyFilter}
            onChange={(event) =>
              setDifficultyFilter(
                event.target.value as "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              )
            }
          >
            <option value="ALL">Toutes difficultes</option>
            {difficultyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={bodyPartFilter}
            onChange={(event) => setBodyPartFilter(event.target.value)}
          >
            <option value="ALL">Toutes zones</option>
            {bodyPartOptions.map((bodyPart) => (
              <option key={bodyPart} value={bodyPart}>
                {bodyPart}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setDifficultyFilter("ALL");
              setBodyPartFilter("ALL");
            }}
          >
            Reinitialiser
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {filteredExercises.length} / {exercises.length} exercice(s)
        </p>
      </div>

      {!filteredExercises.length ? (
        <EmptyState label="Aucun exercice ne correspond a tes filtres." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {filteredExercises.map((exercise) => (
            <li key={exercise.id} className={itemCardClass}>
              <div className="flex h-full flex-col justify-between gap-3">
                <div>
                  <ExerciseImagePreview
                    imageUrl={getExerciseImageUrl(exercise)}
                    label={exercise.name}
                    className="mb-3 h-32 w-full"
                  />
                  <p className="font-semibold">{exercise.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {labelFromOptions(exerciseTypeOptions, exercise.exerciseType)} - {labelFromOptions(difficultyOptions, exercise.difficulty)}
                  </p>
                  {(exercise.bodyParts?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Zone cible: {exercise.bodyParts?.join(", ")}
                    </p>
                  )}
                  {exercise.description && (
                    <p className="mt-2 text-sm text-slate-500">{exercise.description}</p>
                  )}
                </div>
                <ItemActions item={exercise} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
