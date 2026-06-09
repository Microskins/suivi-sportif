import { FormEvent, useEffect, useState } from "react";
import { api, type AssistantDraft, type AssistantDraftContext } from "../../api/client";
import type { DashboardResource } from "./ResourceHeader";

type AssistantChatboxProps = {
  isAuthBypassEnabled: boolean;
  onApplyDraft: (draft: AssistantDraft) => Promise<void>;
  resource: DashboardResource;
};

const contextByResource: Record<DashboardResource, AssistantDraftContext> = {
  bodyGoals: "goals",
  calendar: "workouts",
  dashboard: "dashboard",
  exercises: "workouts",
  foods: "meals",
  goals: "goals",
  meals: "meals",
  measurements: "measurements",
  profile: "profile",
  sportGoals: "goals",
  workouts: "workouts",
};

const examples = [
  "Ajoute ma pesee du jour a 82,4 kg.",
  "Tu peux rajouter mon repas de ce midi ? Riz, poulet.",
  "Cree un aliment fruit rouge avec 45 kcal, proteines 1, glucides 10, lipides 0,5.",
  "Ajoute un exercice hip thrust pour les fessiers.",
  "Planifie une seance push demain a 18h avec developpe couche et dips.",
];

const actionLabels: Record<AssistantDraft["action"], string> = {
  create_body_measurement: "Nouvelle mensuration",
  create_exercise: "Nouvel exercice",
  create_food: "Nouvel aliment",
  create_meal: "Nouveau repas",
  create_user_goal: "Nouvel objectif",
  create_workout: "Nouvelle seance",
  delete_body_measurement: "Suppression mensuration",
  delete_meal: "Suppression repas",
  delete_workout: "Suppression seance",
  unknown: "A preciser",
  update_body_measurement: "Modification mensuration",
  update_meal: "Modification repas",
  update_profile: "Modification profil",
  update_workout: "Modification seance",
};

type AssistantHistoryItem = {
  content: string;
  role: "user" | "assistant";
};

const HISTORY_STORAGE_KEY = "assistant_chat_history";
const MAX_HISTORY_ITEMS = 20;

function formatPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

function assistantReply(draft: AssistantDraft) {
  return draft.reply?.trim() || draft.summary;
}

function missingFieldLabel(field: string) {
  const labels: Record<string, string> = {
    exerciseIds: "exercices a reconnaitre dans ta bibliotheque",
    foodIds: "aliments a reconnaitre dans ta base",
    caloriesKcal: "calories pour 100 g",
    carbsGrams: "glucides pour 100 g",
    fatGrams: "lipides pour 100 g",
    id: "element exact a modifier ou supprimer",
    intent: "demande a preciser",
    items: "aliments du repas",
    quantities: "quantites en grammes ou portions",
    proteinGrams: "proteines pour 100 g",
    sets: "series de la seance",
    targetValue: "valeur cible",
    weightKg: "poids en kg",
  };

  return labels[field] ?? field;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function summarizeMealItems(payload: Record<string, unknown>) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) return [];

  return payload.items
    .filter(isRecord)
    .map((item) => {
      const name =
        typeof item.resolvedName === "string"
          ? item.resolvedName
          : typeof item.name === "string"
            ? item.name
            : "Aliment";
      const status = typeof item.foodId === "string" ? "reconnu" : "a verifier";
      const quantity =
        typeof item.quantityGrams === "number"
          ? `${item.quantityGrams} g`
          : "quantite manquante";

      return { name, quantity, status };
    });
}

function summarizeFood(payload: Record<string, unknown>) {
  if (typeof payload.name !== "string") return null;

  const macros = [
    ["Calories", payload.caloriesKcal, "kcal"],
    ["Proteines", payload.proteinGrams, "g"],
    ["Glucides", payload.carbsGrams, "g"],
    ["Lipides", payload.fatGrams, "g"],
    ["Fibres", payload.fiberGrams, "g"],
  ]
    .filter(([, value]) => typeof value === "number")
    .map(([label, value, unit]) => `${label}: ${value} ${unit}`);

  return {
    macros,
    name: payload.name,
    servingUnit: payload.servingUnit === "unit" ? "par unite" : "pour 100 g",
  };
}

function summarizeExercise(payload: Record<string, unknown>) {
  if (typeof payload.name !== "string") return null;

  return {
    bodyParts: Array.isArray(payload.bodyParts)
      ? payload.bodyParts.filter((part): part is string => typeof part === "string")
      : [],
    difficulty:
      typeof payload.difficulty === "string" ? payload.difficulty : "BEGINNER",
    exerciseType:
      typeof payload.exerciseType === "string" ? payload.exerciseType : "STRENGTH",
    name: payload.name,
  };
}

function draftExplanation(draft: AssistantDraft) {
  if (draft.missingFields.length === 0) {
    return "Tout est pret: tu peux confirmer pour appliquer l'action.";
  }

  if (draft.action === "create_meal" || draft.action === "update_meal") {
    return "Je ne peux pas encore appliquer ce repas: reponds dans le chat avec les aliments ou quantites manquantes.";
  }

  if (draft.action === "create_food") {
    return "Je peux creer cet aliment apres confirmation. Verifie surtout les valeurs nutritionnelles avant de valider.";
  }

  if (draft.action === "create_exercise") {
    return "Je peux ajouter cet exercice a ta bibliotheque apres confirmation.";
  }

  if (draft.action === "create_workout" || draft.action === "update_workout") {
    return "Je ne peux pas encore appliquer cette seance: il manque les exercices exacts et/ou les series.";
  }

  return "Je garde le brouillon bloque tant que ces informations ne sont pas claires.";
}

export function AssistantChatbox({
  isAuthBypassEnabled,
  onApplyDraft,
  resource,
}: AssistantChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<AssistantDraft | null>(null);
  const [history, setHistory] = useState<AssistantHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item): item is AssistantHistoryItem =>
            item !== null &&
            typeof item === "object" &&
            typeof item.content === "string" &&
            (item.role === "user" || item.role === "assistant"),
        )
        .slice(-MAX_HISTORY_ITEMS);
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const foodSummary = draft ? summarizeFood(draft.payload) : null;
  const exerciseSummary = draft ? summarizeExercise(draft.payload) : null;
  const mealItemsSummary = draft ? summarizeMealItems(draft.payload) : [];

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  function appendHistory(items: AssistantHistoryItem[]) {
    setHistory((current) =>
      [...current, ...items].slice(-MAX_HISTORY_ITEMS),
    );
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isAuthBypassEnabled) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.createAssistantDraft({
        context: contextByResource[resource],
        currentDraft: draft ?? undefined,
        history: history.slice(-12),
        message: trimmedMessage,
      });
      setDraft(result);
      appendHistory([
        { content: trimmedMessage, role: "user" },
        { content: assistantReply(result), role: "assistant" },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible de preparer le brouillon assistant",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function applyDraft() {
    if (!draft || draft.missingFields.length > 0 || isAuthBypassEnabled) return;

    setIsApplying(true);
    setError(null);
    setSuccess(null);
    try {
      await onApplyDraft(draft);
      setSuccess("Action appliquee. Les donnees ont ete rafraichies.");
      appendHistory([
        {
          content: "C'est ajoute. J'ai rafraichi les donnees.",
          role: "assistant",
        },
      ]);
      setDraft(null);
      setMessage("");
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Impossible d'appliquer le brouillon assistant",
      );
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-md md:bottom-6 md:right-6">
      {isOpen && (
        <div className="mb-3 overflow-hidden rounded-3xl border border-slate-900/10 bg-[#111812] text-stone-50 shadow-2xl shadow-emerald-950/30">
          <div className="relative isolate overflow-hidden p-4">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-36 w-36 rounded-full bg-lime-200/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    Assistant IA
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Chat d'action V2
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-stone-200 transition hover:bg-white/10"
                >
                  Fermer
                </button>
              </div>

              <form className="mt-4 space-y-3" onSubmit={submit}>
                <textarea
                  className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={
                    draft
                      ? "Reponds ici pour completer le brouillon..."
                      : "Ex: ajoute mon repas de ce midi..."
                  }
                  disabled={isAuthBypassEnabled || isLoading}
                />
                <div className="flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setMessage(example)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-left text-[0.7rem] text-stone-200 transition hover:bg-white/10"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isAuthBypassEnabled || isLoading || message.trim().length < 3}
                  className="w-full rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/30 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "L'assistant reflechit..."
                    : draft
                      ? "Completer le brouillon"
                      : "Envoyer a l'assistant"}
                </button>
              </form>

              {history.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Historique
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHistory([]);
                        setDraft(null);
                      }}
                      className="rounded-full border border-white/10 px-2 py-1 text-[0.68rem] text-stone-200 transition hover:bg-white/10"
                    >
                      Effacer
                    </button>
                  </div>
                  <div className="mt-3 max-h-36 space-y-2 overflow-auto pr-1">
                    {history.slice(-6).map((item, index) => (
                      <p
                        key={`${item.role}-${index}-${item.content}`}
                        className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-stone-100"
                      >
                        <span className="font-semibold text-emerald-100">
                          {item.role === "user" ? "Toi" : "IA"}:
                        </span>{" "}
                        {item.content}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {isAuthBypassEnabled && (
                <p className="mt-3 rounded-2xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                  Le mode bypass est actif: connecte-toi avec un JWT pour utiliser l'assistant.
                </p>
              )}

              {error && (
                <p className="mt-3 rounded-2xl border border-red-300/30 bg-red-300/10 px-3 py-2 text-xs text-red-100">
                  {error}
                </p>
              )}

              {success && (
                <p className="mt-3 rounded-2xl border border-emerald-200/30 bg-emerald-200/10 px-3 py-2 text-xs text-emerald-100">
                  {success}
                </p>
              )}

              {draft && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-950">
                      {actionLabels[draft.action]}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-stone-200">
                      Confiance {draft.confidence}
                    </span>
                  </div>
                  <p className="mt-3 rounded-xl bg-emerald-100/10 px-3 py-2 text-sm leading-relaxed text-stone-50">
                    {assistantReply(draft)}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Brouillon propose
                  </p>
                  <p className="mt-2 text-sm text-stone-100">{draft.summary}</p>
                  <p className="mt-2 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs leading-relaxed text-amber-50">
                    {draftExplanation(draft)}
                  </p>
                  {draft.missingFields.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                        A completer
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {draft.missingFields.map((field) => (
                          <span
                            key={field}
                            className="rounded-full border border-amber-100/20 bg-amber-100/10 px-3 py-1 text-xs text-amber-50"
                          >
                            {missingFieldLabel(field)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {mealItemsSummary.length > 0 && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Aliments detectes
                      </p>
                      <div className="mt-2 space-y-2">
                        {mealItemsSummary.map((item) => (
                          <div
                            key={`${item.name}-${item.quantity}-${item.status}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs"
                          >
                            <span className="font-semibold text-stone-50">
                              {item.name}
                            </span>
                            <span className="text-stone-300">{item.quantity}</span>
                            <span
                              className={
                                item.status === "reconnu"
                                  ? "rounded-full bg-emerald-200 px-2 py-0.5 font-semibold text-emerald-950"
                                  : "rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-950"
                              }
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {foodSummary && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Aliment propose
                      </p>
                      <div className="mt-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs">
                        <p className="font-semibold text-stone-50">
                          {foodSummary.name}
                        </p>
                        <p className="mt-1 text-stone-300">
                          Valeurs {foodSummary.servingUnit}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {foodSummary.macros.map((macro) => (
                            <span
                              key={macro}
                              className="rounded-full bg-emerald-100/10 px-2 py-1 text-emerald-50"
                            >
                              {macro}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {exerciseSummary && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Exercice propose
                      </p>
                      <div className="mt-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs">
                        <p className="font-semibold text-stone-50">
                          {exerciseSummary.name}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-100/10 px-2 py-1 text-emerald-50">
                            {exerciseSummary.exerciseType}
                          </span>
                          <span className="rounded-full bg-emerald-100/10 px-2 py-1 text-emerald-50">
                            {exerciseSummary.difficulty}
                          </span>
                          {exerciseSummary.bodyParts.map((part) => (
                            <span
                              key={part}
                              className="rounded-full bg-lime-100/10 px-2 py-1 text-lime-50"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <details className="mt-3 rounded-xl bg-black/35 text-xs text-emerald-50">
                    <summary className="cursor-pointer px-3 py-2 font-semibold text-emerald-100">
                      Voir les donnees techniques
                    </summary>
                    <pre className="max-h-48 overflow-auto p-3 pt-0 leading-relaxed">
                    {formatPayload(draft.payload)}
                    </pre>
                  </details>
                  <button
                    type="button"
                    onClick={applyDraft}
                    disabled={draft.missingFields.length > 0 || isApplying}
                    className="mt-3 w-full rounded-xl border border-emerald-200/40 bg-emerald-200 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-stone-300"
                  >
                    {draft.missingFields.length > 0
                      ? "Complete les champs manquants avant confirmation"
                      : isApplying
                        ? "Application..."
                        : "Confirmer et appliquer"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="ml-auto flex min-h-14 items-center gap-3 rounded-full border border-emerald-900/10 bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-emerald-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-200 text-emerald-950">
          IA
        </span>
        Assistant
      </button>
    </aside>
  );
}
