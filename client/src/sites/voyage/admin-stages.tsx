import { useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import type { StageDraft } from "./admin-form";
import { emptyStage, moveItem } from "./admin-form";
import type { StageFiles } from "./admin-stage-files";
import { AdminStageFiles } from "./admin-stage-files";
import { Panel, TextAreaField, TextField, buttonClass } from "./admin-ui";

type StagesProps = {
  disabled: boolean;
  errors: Record<string, string>;
  onAuthError: AuthErrorHandler;
  onChange: (stages: StageDraft[]) => void;
  onSave: () => void;
  stages: StageDraft[];
};

const stageName = (stage: StageDraft, index: number) =>
  `Étape ${index + 1}${stage.title.trim() ? ` — ${stage.title.trim()}` : ""}`;

export function AdminStages({
  disabled,
  errors,
  onAuthError,
  onChange,
  onSave,
  stages,
}: StagesProps) {
  // Etapes depliees: les nouvelles d'office, les autres a la demande.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [announce, setAnnounce] = useState("");

  const update = (key: string, patch: Partial<StageDraft>) =>
    onChange(
      stages.map((stage) =>
        stage.key === key ? { ...stage, ...patch } : stage,
      ),
    );

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function add() {
    const stage = emptyStage();
    setExpanded((current) => new Set(current).add(stage.key));
    onChange([...stages, stage]);
    setAnnounce(`Étape ${stages.length + 1} ajoutée en fin de liste.`);
  }

  function move(index: number, to: number) {
    onChange(moveItem(stages, index, to));
    setAnnounce(
      `${stageName(stages[index], index)} déplacée en position ${to + 1}.`,
    );
  }

  function remove(index: number) {
    const stage = stages[index];
    const files = stage.tracks.length + stage.photos.length;
    const warning = files
      ? ` Ses ${files} fichier(s) (traces et photos) seront supprimés à l’enregistrement.`
      : "";
    if (
      !window.confirm(`Supprimer « ${stageName(stage, index)} » ?${warning}`)
    ) {
      return;
    }
    onChange(stages.filter((_, i) => i !== index));
    setAnnounce(
      `${stageName(stage, index)} retirée. Enregistrez le voyage pour confirmer.`,
    );
  }

  return (
    <Panel
      title={`Étapes (${stages.length})`}
      actions={
        <button
          type="button"
          className={buttonClass.secondary}
          disabled={disabled}
          onClick={add}
        >
          Ajouter une étape
        </button>
      }
    >
      <p role="status" className="sr-only">
        {announce}
      </p>
      {stages.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[#c9d1db] p-5 text-sm text-[var(--site-muted)]">
          Aucune étape : le carnet affichera « étapes à écrire ». Ajoutez-en une
          pour décrire le parcours jour par jour.
        </p>
      ) : (
        <ol className="grid gap-4">
          {stages.map((stage, index) => {
            const prefix = `stages.${index}.`;
            const hasError = Object.keys(errors).some((path) =>
              path.startsWith(prefix),
            );
            const open = hasError || expanded.has(stage.key);
            const name = stageName(stage, index);
            const bodyId = `etape-${stage.key}`;
            return (
              <li
                key={stage.key}
                className={`rounded-[10px] border p-4 ${hasError ? "border-[#b42318]" : "border-[#dfe4ea]"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="site-display text-base font-semibold">
                    <span className="site-label mr-2 text-xs font-semibold tracking-[0.1em] text-[#1c4ed8]">
                      {String(index + 1).padStart(2, "0")}
                      {stage.code.trim()
                        ? ` · ${stage.code.trim().toUpperCase()}`
                        : ""}
                    </span>
                    {stage.title.trim() || "Nouvelle étape"}
                    {!stage.id && (
                      <span className="site-label ml-2 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[var(--site-accent-2-text)]">
                        Non enregistrée
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={buttonClass.small}
                      aria-expanded={open}
                      aria-controls={bodyId}
                      aria-label={`${open ? "Replier" : "Modifier"} ${name}`}
                      onClick={() => toggle(stage.key)}
                    >
                      {open ? "Replier" : "Modifier"}
                    </button>
                    <button
                      type="button"
                      className={buttonClass.small}
                      disabled={disabled || index === 0}
                      aria-label={`Monter ${name}`}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑ Monter
                    </button>
                    <button
                      type="button"
                      className={buttonClass.small}
                      disabled={disabled || index === stages.length - 1}
                      aria-label={`Descendre ${name}`}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓ Descendre
                    </button>
                    <button
                      type="button"
                      className={buttonClass.smallDanger}
                      disabled={disabled}
                      aria-label={`Supprimer ${name}`}
                      onClick={() => remove(index)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div id={bodyId} hidden={!open}>
                  <StageFields
                    disabled={disabled}
                    errors={errors}
                    prefix={prefix}
                    stage={stage}
                    onChange={(patch) => update(stage.key, patch)}
                  />
                  {stage.id ? (
                    <AdminStageFiles
                      stageId={stage.id}
                      stageLabel={name}
                      tracks={stage.tracks}
                      photos={stage.photos}
                      onAuthError={onAuthError}
                      onChange={(files: StageFiles) => update(stage.key, files)}
                    />
                  ) : (
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#dfe4ea] pt-5 text-sm">
                      <p className="text-[var(--site-muted)]">
                        Les traces GPX et les photos s’ajoutent une fois l’étape
                        enregistrée.
                      </p>
                      <button
                        type="button"
                        className={buttonClass.small}
                        disabled={disabled}
                        onClick={onSave}
                      >
                        Enregistrer le voyage maintenant
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

function StageFields({
  disabled,
  errors,
  onChange,
  prefix,
  stage,
}: {
  disabled: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<StageDraft>) => void;
  prefix: string;
  stage: StageDraft;
}) {
  const field = (name: keyof StageDraft & string) => ({
    value: stage[name] as string,
    error: errors[`${prefix}${name}`],
    disabled,
    onChange: (event: { target: { value: string } }) =>
      onChange({ [name]: event.target.value }),
  });

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-6">
      <TextField
        className="sm:col-span-2"
        label="Code"
        hint="2 à 4 lettres (ex. EDI)."
        required
        maxLength={4}
        {...field("code")}
      />
      <TextField
        className="sm:col-span-2"
        label="Jours"
        hint="Ex. J01—02"
        required
        maxLength={20}
        {...field("dayLabel")}
      />
      <TextField
        className="sm:col-span-2"
        label="Dates"
        hint="Ex. 19—20 oct."
        required
        maxLength={40}
        {...field("dateLabel")}
      />
      <TextField
        className="sm:col-span-6"
        label="Titre de l’étape"
        required
        maxLength={120}
        {...field("title")}
      />
      <TextAreaField
        className="sm:col-span-6"
        label="Récit"
        rows={4}
        maxLength={2000}
        {...field("detail")}
      />
      <TextField
        className="sm:col-span-6"
        label="Temps forts"
        hint="Séparés par des virgules (ex. Royal Mile, Arthur’s Seat)."
        {...field("highlights")}
        error={
          errors[`${prefix}highlights`] ??
          firstNested(errors, `${prefix}highlights.`)
        }
      />
      <TextField
        className="sm:col-span-3"
        label="Longitude"
        hint="Entre -180 et 180, ouest négatif (ex. -3.19)."
        inputMode="decimal"
        required
        {...field("lng")}
      />
      <TextField
        className="sm:col-span-3"
        label="Latitude"
        hint="Entre -90 et 90 (ex. 55.95)."
        inputMode="decimal"
        required
        {...field("lat")}
      />
      {stage.route.length > 0 && (
        <p className="site-label text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)] sm:col-span-6">
          Tracé d’arrivée : {stage.route.length} points, conservés tels quels.
        </p>
      )}
    </div>
  );
}

const firstNested = (errors: Record<string, string>, prefix: string) =>
  Object.entries(errors).find(([path]) => path.startsWith(prefix))?.[1];
