import { FormEvent, useState } from "react";
import type { Exercise, ExerciseInput } from "../../api/client";
import { Field, FormActions, inputClass } from "./shared";

type ExerciseFormProps = {
  item?: Exercise;
  onSubmit: (data: ExerciseInput) => Promise<void>;
  onCancel: () => void;
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

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ExerciseForm({ item, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [difficulty, setDifficulty] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >(
    item?.difficulty === "BEGINNER" ||
      item?.difficulty === "INTERMEDIATE" ||
      item?.difficulty === "ADVANCED"
      ? item.difficulty
      : "BEGINNER",
  );
  const [exerciseType, setExerciseType] = useState<
    "STRENGTH" | "CARDIO" | "MOBILITY"
  >(
    item?.exerciseType === "STRENGTH" ||
      item?.exerciseType === "CARDIO" ||
      item?.exerciseType === "MOBILITY"
      ? item.exerciseType
      : "STRENGTH",
  );
  const [bodyParts, setBodyParts] = useState((item?.bodyParts ?? []).join(", "));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        description: emptyToNull(description),
        difficulty,
        exerciseType,
        bodyParts: bodyParts
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nom">
        <input
          className={inputClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      <Field label="Description">
        <textarea
          className={inputClass}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Difficulte">
          <select
            className={inputClass}
            value={difficulty}
            onChange={(event) =>
              setDifficulty(
                event.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              )
            }
          >
            {difficultyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={exerciseType}
            onChange={(event) =>
              setExerciseType(
                event.target.value as "STRENGTH" | "CARDIO" | "MOBILITY",
              )
            }
          >
            {exerciseTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Parties du corps (separees par des virgules)">
        <input
          className={inputClass}
          value={bodyParts}
          onChange={(event) => setBodyParts(event.target.value)}
          placeholder="Pectoraux, Triceps, Epaules"
        />
      </Field>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}
