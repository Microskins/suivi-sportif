import { useState } from "react";
import { AdminAddressSearch } from "./admin-address-search";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import type { StageDraft } from "./admin-form";
import {
  emptyStage,
  hasPosition,
  moveItem,
  placeStage,
  stageCoordinates,
} from "./admin-form";
import type { StageFiles } from "./admin-stage-files";
import { AdminStageFiles } from "./admin-stage-files";
import { AdminStageMeals } from "./admin-stage-meals";
import type { LngLat } from "./trip-types";
import {
  Panel,
  StageSection,
  TextAreaField,
  TextField,
  buttonClass,
} from "./admin-ui";

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
  const [routing, setRouting] = useState<string | null>(null);
  const [routeReport, setRouteReport] = useState("");

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

  // Trace de chaque etape depuis la precedente, par la route. Les appels se
  // suivent a une seconde d'intervalle: le serveur OSRM public limite le
  // debit. Le resultat ne part en base qu'avec l'enregistrement du voyage.
  async function traceRoads() {
    const routes = new Map<string, StageDraft["route"]>();
    const failures: string[] = [];
    let distanceKm = 0;
    for (let index = 1; index < stages.length; index += 1) {
      const from = stageCoordinates(stages[index - 1]);
      const to = stageCoordinates(stages[index]);
      const name = stageName(stages[index], index);
      if (!from || !to) {
        failures.push(`${name} : coordonnées à compléter`);
        continue;
      }
      setRouting(`Calcul de l’itinéraire ${index} / ${stages.length - 1}…`);
      if (routes.size + failures.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
      try {
        const result = await adminApi.roadRoute(from, to);
        routes.set(stages[index].key, result.route);
        distanceKm += result.distanceKm;
      } catch (error) {
        if (onAuthError(error)) {
          setRouting(null);
          return;
        }
        failures.push(`${name} : ${adminErrorMessage(error)}`);
      }
    }
    setRouting(null);
    if (routes.size > 0) {
      onChange(
        stages.map((stage) =>
          routes.has(stage.key)
            ? { ...stage, route: routes.get(stage.key)! }
            : stage,
        ),
      );
    }
    const summary =
      routes.size > 0
        ? `${routes.size} itinéraire(s) routier(s) tracé(s), ${Math.round(distanceKm)} km au total. Enregistrez le voyage pour les garder.`
        : "Aucun itinéraire tracé.";
    setRouteReport(
      failures.length
        ? `${summary} À revoir — ${failures.join(" ; ")}.`
        : summary,
    );
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass.secondary}
            disabled={disabled || routing !== null || stages.length < 2}
            onClick={traceRoads}
          >
            {routing ?? "Tracer par la route"}
          </button>
          <button
            type="button"
            className={buttonClass.secondary}
            disabled={disabled || routing !== null}
            onClick={add}
          >
            Ajouter une étape
          </button>
        </div>
      }
    >
      <p role="status" className="sr-only">
        {announce}
      </p>
      {routeReport && (
        <p
          role="status"
          className="mb-4 rounded-[10px] bg-[#eef2f6] p-3 text-sm leading-6"
        >
          {routeReport}
        </p>
      )}
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
                    name={name}
                    onAuthError={onAuthError}
                    prefix={prefix}
                    stage={stage}
                    onChange={(patch) => update(stage.key, patch)}
                    onPlace={(coordinates) =>
                      onChange(placeStage(stages, stage.key, coordinates))
                    }
                  />
                  <div className="mt-4">
                    <StageSection
                      number={5}
                      tone="green"
                      title="Traces GPX et photos"
                      hint="Les fichiers sont envoyés tout de suite, sans attendre l’enregistrement du voyage."
                    >
                      {stage.id ? (
                        <AdminStageFiles
                          stageId={stage.id}
                          stageLabel={name}
                          tracks={stage.tracks}
                          photos={stage.photos}
                          onAuthError={onAuthError}
                          onChange={(files: StageFiles) =>
                            update(stage.key, files)
                          }
                        />
                      ) : (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <p className="text-[var(--site-muted)]">
                            Les traces GPX et les photos s’ajoutent une fois
                            l’étape enregistrée.
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
                    </StageSection>
                  </div>
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
  name,
  onAuthError,
  onChange,
  onPlace,
  prefix,
  stage,
}: {
  disabled: boolean;
  errors: Record<string, string>;
  name: string;
  onAuthError: AuthErrorHandler;
  onChange: (patch: Partial<StageDraft>) => void;
  onPlace: (coordinates: LngLat) => void;
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
    <div className="mt-4 grid gap-4">
      <StageSection
        number={1}
        tone="blue"
        title="Repères"
        hint="Ce qui identifie l’étape sur la carte et dans la feuille de route."
      >
        <div className="grid gap-4 sm:grid-cols-6">
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
        </div>
      </StageSection>

      <StageSection
        number={2}
        tone="violet"
        title="Récit"
        hint="Le texte du carnet et les temps forts affichés en étiquettes."
      >
        <div className="grid gap-4">
          <TextAreaField
            label="Récit"
            rows={4}
            maxLength={2000}
            {...field("detail")}
          />
          <TextField
            label="Temps forts"
            hint="Séparés par des virgules (ex. Royal Mile, Arthur’s Seat)."
            {...field("highlights")}
            error={
              errors[`${prefix}highlights`] ??
              firstNested(errors, `${prefix}highlights.`)
            }
          />
        </div>
      </StageSection>

      <StageSection
        number={3}
        tone="rose"
        title="Nuit et position"
        hint="Où vous avez dormi : son adresse place l’étape sur la carte."
      >
        <div className="grid gap-4">
          <TextField
            label="Logement (lien Airbnb)"
            hint="Ex. https://www.airbnb.fr/rooms/12345678 — les dates et voyageurs du lien sont retirés."
            inputMode="url"
            maxLength={500}
            {...field("lodgingUrl")}
          />
          <AdminAddressSearch
            disabled={disabled}
            error={
              errors[`${prefix}position`] ??
              firstNested(errors, `${prefix}coordinates`)
            }
            positioned={hasPosition(stage)}
            onPick={onPlace}
          />
          {stage.route.length > 0 && (
            <p className="site-label text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
              Tracé depuis l’étape précédente : {stage.route.length} points. «
              Tracer par la route » le remplace par l’itinéraire routier.
            </p>
          )}
        </div>
      </StageSection>

      <StageSection
        number={4}
        tone="orange"
        title={`Repas${stage.meals.length ? ` (${stage.meals.length})` : ""}`}
        hint="Facultatif. Restaurants, pubs ou cafés où vous avez mangé, avec une photo si vous en avez : chacun devient un point sur la carte."
      >
        <AdminStageMeals
          disabled={disabled}
          errors={errors}
          meals={stage.meals}
          onAuthError={onAuthError}
          prefix={prefix}
          stageLabel={name}
          onChange={(meals) => onChange({ meals })}
        />
      </StageSection>
    </div>
  );
}

const firstNested = (errors: Record<string, string>, prefix: string) =>
  Object.entries(errors).find(([path]) => path.startsWith(prefix))?.[1];
