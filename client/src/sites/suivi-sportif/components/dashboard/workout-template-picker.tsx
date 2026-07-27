import { FormEvent, useEffect, useState } from "react";
import type { Exercise, WorkoutTemplate } from "../../api/client";
import { WorkoutTemplateFilters } from "./workout-template-filters";
import { WorkoutTemplateRows, type WorkoutTemplateRow } from "./workout-template-rows";
import {
  dateTimeToIso,
  emptyToNull,
  recommendedRestSecondsForExercise,
  toInputDateTime,
} from "./workout-form-utils";
import {
  activeViewButtonClass,
  buttonClass,
  EmptyState,
  Field,
  inactiveViewButtonClass,
  inputClass,
  secondaryButtonClass,
} from "./shared";

type WorkoutTemplatePayload = {
  name: string;
  category: string;
  level: string;
  duration: number;
  description?: string | null;
  exercises: Array<{
    exerciseId: string;
    order: number;
    sets: number;
    reps: number;
    rest: number;
    weight: number;
    durationSeconds?: number | null;
  }>;
};

export function WorkoutTemplatePicker({
  templates,
  exercises,
  onInstantiate,
  onCreateTemplate,
  onUpdateTemplate,
  onCancel,
}: {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  onInstantiate: (id: string, date: string) => Promise<void>;
  onCreateTemplate: (data: WorkoutTemplatePayload) => Promise<void>;
  onUpdateTemplate: (id: string, data: WorkoutTemplatePayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"instantiate" | "create" | "edit">("instantiate");
  const [date, setDate] = useState(toInputDateTime());
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("ALL");
  const [templateLevelFilter, setTemplateLevelFilter] = useState("ALL");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Musculation");
  const [level, setLevel] = useState("Intermediaire");
  const [duration, setDuration] = useState("45");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<WorkoutTemplateRow[]>(
    exercises[0]
      ? [{
          exerciseId: exercises[0].id,
          sets: "3",
          reps: "10",
          rest: String(recommendedRestSecondsForExercise(exercises[0])),
          weight: "0",
        }]
      : [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedTemplateRowIndex, setDraggedTemplateRowIndex] = useState<number | null>(null);
  const [dragOverTemplateRowIndex, setDragOverTemplateRowIndex] = useState<number | null>(null);
  const templateCategories = Array.from(new Set(templates.map((template) => template.category))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const templateLevels = Array.from(new Set(templates.map((template) => template.level))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const normalizedTemplateSearch = templateSearch.trim().toLocaleLowerCase("fr-FR");
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      normalizedTemplateSearch.length === 0 ||
      template.name.toLocaleLowerCase("fr-FR").includes(normalizedTemplateSearch) ||
      (template.description?.toLocaleLowerCase("fr-FR").includes(normalizedTemplateSearch) ?? false);
    const matchesCategory =
      templateCategoryFilter === "ALL" || template.category === templateCategoryFilter;
    const matchesLevel = templateLevelFilter === "ALL" || template.level === templateLevelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  function resetTemplateFormToCreateDefaults() {
    setName("");
    setCategory("Musculation");
    setLevel("Intermediaire");
    setDuration("45");
    setDescription("");
    setRows(
      exercises[0]
        ? [{
            exerciseId: exercises[0].id,
            sets: "3",
            reps: "10",
            rest: String(recommendedRestSecondsForExercise(exercises[0])),
            weight: "0",
          }]
        : [],
    );
  }

  useEffect(() => {
    if (!templates.length) {
      setSelectedId("");
      return;
    }

    const selectedStillExists = templates.some((item) => item.id === selectedId);
    if (!selectedStillExists) {
      setSelectedId(templates[0].id);
    }
  }, [selectedId, templates]);

  useEffect(() => {
    if (mode !== "instantiate" || !filteredTemplates.length) {
      return;
    }
    if (!filteredTemplates.some((template) => template.id === selectedId)) {
      setSelectedId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, mode, selectedId]);

  useEffect(() => {
    const selectedTemplate = templates.find((item) => item.id === selectedId);
    if (!selectedTemplate || mode !== "edit") {
      return;
    }

    setName(selectedTemplate.name);
    setCategory(selectedTemplate.category);
    setLevel(selectedTemplate.level);
    setDuration(String(selectedTemplate.duration));
    setDescription(selectedTemplate.description ?? "");
    setRows(
      selectedTemplate.exercises.map((entry) => ({
        exerciseId: entry.exerciseId,
        sets: String(entry.sets),
        reps: String(entry.reps),
        rest: String(entry.rest),
        weight: String(entry.weight),
      })),
    );
  }, [mode, selectedId, templates]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    try {
      if (mode === "instantiate") {
        if (!selectedId) {
          return;
        }
        await onInstantiate(selectedId, dateTimeToIso(date));
      } else if (mode === "create") {
        await onCreateTemplate({
          name,
          category,
          level,
          duration: Number(duration),
          description: emptyToNull(description),
          exercises: rows.map((row, index) => ({
            exerciseId: row.exerciseId,
            order: index,
            sets: Number(row.sets),
            reps: Number(row.reps),
            rest: Number(row.rest),
            weight: Number(row.weight),
          })),
        });
      } else if (selectedId) {
        await onUpdateTemplate(selectedId, {
          name,
          category,
          level,
          duration: Number(duration),
          description: emptyToNull(description),
          exercises: rows.map((row, index) => ({
            exerciseId: row.exerciseId,
            order: index,
            sets: Number(row.sets),
            reps: Number(row.reps),
            rest: Number(row.rest),
            weight: Number(row.weight),
          })),
        });
      }
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button type="button" className={mode === "instantiate" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setMode("instantiate")}>Creer une seance</button>
        <button
          type="button"
          className={mode === "create" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={() => {
            setMode("create");
            resetTemplateFormToCreateDefaults();
          }}
        >
          Creer un modele
        </button>
        <button
          type="button"
          className={mode === "edit" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={() => {
            if (templates.length) {
              setSelectedId((current) =>
                templates.some((item) => item.id === current) ? current : templates[0].id,
              );
            }
            setMode("edit");
          }}
          disabled={!templates.length}
        >
          Modifier un modele
        </button>
      </div>
      {mode === "instantiate" ? (
        <>
          <Field label="Date de la seance">
            <input
              className={inputClass}
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>
          {!templates.length && <EmptyState label="Aucun modele de seance disponible." />}
          {templates.length > 0 && (
            <WorkoutTemplateFilters
              templateSearch={templateSearch}
              templateCategoryFilter={templateCategoryFilter}
              templateLevelFilter={templateLevelFilter}
              templateCategories={templateCategories}
              templateLevels={templateLevels}
              onTemplateSearchChange={setTemplateSearch}
              onTemplateCategoryFilterChange={setTemplateCategoryFilter}
              onTemplateLevelFilterChange={setTemplateLevelFilter}
            />
          )}
          {templates.length > 0 && !filteredTemplates.length && (
            <EmptyState label="Aucun modele ne correspond aux filtres." />
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredTemplates.map((template) => (
              <label
                key={template.id}
                className={`block rounded border p-4 text-sm ${
                  selectedId === template.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="workout-template"
                    value={template.id}
                    checked={selectedId === template.id}
                    onChange={() => setSelectedId(template.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-slate-950">
                      {template.name}
                    </span>
                    <span className="mt-1 block text-slate-600">
                      {template.category} - {template.level} - {template.duration} min
                    </span>
                    <span className="mt-1 block text-slate-500">
                      {template.exercises.length} exercice(s)
                    </span>
                    {template.description && (
                      <span className="mt-2 block text-slate-500">
                        {template.description}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3 rounded border border-slate-200 p-3">
          {mode === "edit" && (
            <Field label="Modele a modifier">
              <select className={inputClass} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nom">
              <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field label="Categorie">
              <input className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)} required />
            </Field>
            <Field label="Niveau">
              <input className={inputClass} value={level} onChange={(event) => setLevel(event.target.value)} required />
            </Field>
            <Field label="Duree (min)">
              <input className={inputClass} type="number" min="0" value={duration} onChange={(event) => setDuration(event.target.value)} required />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputClass} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <WorkoutTemplateRows
            exercises={exercises}
            rows={rows}
            draggedTemplateRowIndex={draggedTemplateRowIndex}
            dragOverTemplateRowIndex={dragOverTemplateRowIndex}
            setRows={setRows}
            setDraggedTemplateRowIndex={setDraggedTemplateRowIndex}
            setDragOverTemplateRowIndex={setDragOverTemplateRowIndex}
          />
        </div>
      )}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button type="button" className={secondaryButtonClass} onClick={onCancel}>
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving || (mode === "instantiate" ? !selectedId : rows.length === 0 || (mode === "edit" && !selectedId))}
          className={buttonClass}
        >
          {isSaving
            ? "Enregistrement..."
            : mode === "instantiate"
              ? "Creer la seance"
              : mode === "create"
                ? "Creer le modele"
                : "Mettre a jour le modele"}
        </button>
      </div>
    </form>
  );
}
