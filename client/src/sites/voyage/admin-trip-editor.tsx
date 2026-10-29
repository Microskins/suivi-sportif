import { useEffect, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage, fieldErrors } from "./admin-api";
import { AdminFlights } from "./admin-flights";
import type { TripDraft } from "./admin-form";
import {
  draftToPayload,
  emptyTrip,
  localErrors,
  tripToDraft,
} from "./admin-form";
import { AdminStages } from "./admin-stages";
import {
  ErrorAlert,
  Panel,
  TextAreaField,
  TextField,
  buttonClass,
} from "./admin-ui";
import type { Airport, TripDetail } from "./trip-types";
import { tripHref } from "./trip-types";

type EditorProps = {
  onAuthError: AuthErrorHandler;
  onBack: () => void;
  tripId: string | null;
};

type LoadState = "loading" | "ready" | "error";

// Apres enregistrement, le formulaire repart de la reponse de l'API (ids des
// nouvelles etapes) en gardant les cles locales: les etapes depliees le
// restent et React ne remonte pas les champs.
function mergeSaved(previous: TripDraft, trip: TripDetail): TripDraft {
  const next = tripToDraft(trip);
  return {
    ...next,
    flights: next.flights.map((flight, index) => ({
      ...flight,
      key: previous.flights[index]?.key ?? flight.key,
    })),
    stages: next.stages.map((stage, index) => ({
      ...stage,
      key: previous.stages[index]?.key ?? stage.key,
    })),
  };
}

export function AdminTripEditor({ onAuthError, onBack, tripId }: EditorProps) {
  const [currentId, setCurrentId] = useState(tripId);
  const [load, setLoad] = useState<LoadState>(tripId ? "loading" : "ready");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<TripDraft>(emptyTrip);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [savedPublished, setSavedPublished] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fail = (failure: unknown) => {
      if (cancelled || onAuthError(failure)) return;
      setLoadError(adminErrorMessage(failure));
      setLoad("error");
    };
    adminApi
      .listAirports()
      .then((list) => !cancelled && setAirports(list))
      .catch(fail);
    if (tripId) {
      adminApi
        .getTrip(tripId)
        .then((trip) => {
          if (cancelled) return;
          setDraft(tripToDraft(trip));
          setSavedSlug(trip.slug);
          setSavedPublished(trip.published);
          setLoad("ready");
        })
        .catch(fail);
    }
    return () => {
      cancelled = true;
    };
  }, [tripId, onAuthError]);

  const set = <K extends keyof TripDraft>(name: K, value: TripDraft[K]) =>
    setDraft((current) => ({ ...current, [name]: value }));

  const text = (name: keyof TripDraft & string) => ({
    value: draft[name] as string,
    error: errors[name],
    disabled: busy !== null,
    onChange: (event: { target: { value: string } }) =>
      set(name, event.target.value as never),
  });

  async function save() {
    setStatus("");
    const local = localErrors(draft);
    if (Object.keys(local).length) {
      setErrors(local);
      setError("Le voyage n’a pas été enregistré : corrigez les coordonnées.");
      return;
    }
    setBusy("save");
    setError(null);
    setErrors({});
    try {
      const payload = draftToPayload(draft);
      const trip = currentId
        ? await adminApi.updateTrip(currentId, payload)
        : await adminApi.createTrip(payload);
      setDraft((previous) => mergeSaved(previous, trip));
      setSavedSlug(trip.slug);
      setSavedPublished(trip.published);
      setStatus(currentId ? "Voyage enregistré." : "Voyage créé.");
      setCurrentId(trip.id);
    } catch (failure) {
      if (!onAuthError(failure)) {
        const message = adminErrorMessage(failure);
        const fields = fieldErrors(failure);
        if ((failure as { code?: string }).code === "TRIP_SLUG_TAKEN") {
          fields.slug = message;
        }
        setErrors(fields);
        setError(message);
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!currentId) return;
    if (
      !window.confirm(
        `Supprimer définitivement « ${draft.title || "ce voyage"} », ses étapes, traces et photos ?`,
      )
    ) {
      return;
    }
    setBusy("delete");
    setError(null);
    try {
      await adminApi.deleteTrip(currentId);
      onBack();
    } catch (failure) {
      if (!onAuthError(failure)) setError(adminErrorMessage(failure));
      setBusy(null);
    }
  }

  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="site-label text-xs font-semibold uppercase tracking-[0.12em] text-[#1c4ed8] hover:underline"
    >
      ← Tous les voyages
    </button>
  );

  if (load !== "ready") {
    return (
      <div>
        {backButton}
        {load === "loading" ? (
          <p role="status" className="mt-6 text-[var(--site-muted)]">
            Chargement du voyage…
          </p>
        ) : (
          <div className="mt-6">
            <ErrorAlert>{loadError}</ErrorAlert>
          </div>
        )}
      </div>
    );
  }

  const disabled = busy !== null;
  const errorCount = Object.keys(errors).length;

  return (
    <div>
      {backButton}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
            {currentId ? "Modifier un voyage" : "Nouveau voyage"}
          </p>
          <h1 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
            {draft.title.trim() || "Sans titre"}
          </h1>
        </div>
        {savedSlug && savedPublished && (
          <a href={tripHref(savedSlug)} className={buttonClass.secondary}>
            Voir la page →
          </a>
        )}
      </div>
      {loadError && (
        <div className="mt-4">
          <ErrorAlert>{loadError}</ErrorAlert>
        </div>
      )}

      <div className="mt-8 grid gap-6">
        <Panel title="Informations">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Titre"
              required
              maxLength={120}
              {...text("title")}
            />
            <TextField
              label="Pays"
              required
              maxLength={80}
              {...text("country")}
            />
            <TextField
              label="Slug (adresse de la page)"
              hint="Minuscules, chiffres et tirets : /voyage/ecosse-2026."
              required
              maxLength={60}
              autoComplete="off"
              {...text("slug")}
            />
            <TextField
              label="Libellé du talon"
              hint="Ex. SCO / 2026."
              required
              maxLength={30}
              {...text("stubLabel")}
            />
            <TextAreaField
              className="sm:col-span-2"
              label="Description"
              maxLength={1000}
              {...text("description")}
            />
          </div>
        </Panel>

        <Panel title="Dates et publication">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Date de début"
              type="date"
              {...text("startDate")}
            />
            <TextField label="Date de fin" type="date" {...text("endDate")} />
            <label className="flex items-start gap-3 sm:col-span-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[#1c4ed8]"
                checked={draft.published}
                disabled={disabled}
                onChange={(event) => set("published", event.target.checked)}
              />
              <span>
                <span className="font-semibold">Publié</span>
                <span className="block text-sm text-[var(--site-muted)]">
                  Visible sur le globe et à l’adresse /voyage/
                  {draft.slug.trim() || "<slug>"}. Décoché, le voyage reste un
                  brouillon.
                </span>
              </span>
            </label>
          </div>
        </Panel>

        <AdminFlights
          airports={airports}
          disabled={disabled}
          errors={errors}
          flights={draft.flights}
          onAuthError={onAuthError}
          onChange={(flights) => set("flights", flights)}
          onAirportSaved={(airport) =>
            setAirports((list) =>
              [
                ...list.filter((item) => item.code !== airport.code),
                airport,
              ].sort((a, b) => a.code.localeCompare(b.code)),
            )
          }
        />

        <AdminStages
          disabled={disabled}
          errors={errors}
          stages={draft.stages}
          onAuthError={onAuthError}
          onChange={(stages) => {
            set("stages", stages);
            // Les erreurs d'etape sont indexees par position: un ajout, un
            // retrait ou un deplacement les rendrait trompeuses.
            if (
              stages.length !== draft.stages.length ||
              stages.some((stage, i) => stage.key !== draft.stages[i]?.key)
            ) {
              setErrors((current) =>
                Object.fromEntries(
                  Object.entries(current).filter(
                    ([path]) => !path.startsWith("stages."),
                  ),
                ),
              );
            }
          }}
          onSave={save}
        />
      </div>

      <div className="bottom-0 z-10 mt-8 sm:sticky grid gap-3 border-t border-[#dfe4ea] bg-[#f4f6f8]/95 py-4 backdrop-blur">
        <ErrorAlert>
          {error &&
            `${error}${errorCount > 1 ? ` (${errorCount} champs signalés)` : ""}`}
        </ErrorAlert>
        <p role="status" className="text-sm font-medium text-[#1c4ed8]">
          {status}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className={buttonClass.primary}
            disabled={disabled}
            onClick={save}
          >
            {busy === "save" ? "Enregistrement…" : "Enregistrer le voyage"}
          </button>
          {currentId && (
            <button
              type="button"
              className={buttonClass.danger}
              disabled={disabled}
              onClick={remove}
            >
              {busy === "delete" ? "Suppression…" : "Supprimer le voyage"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
