import { FormEvent, useEffect, useRef, useState } from "react";
import {
  api,
  type AssistantDraft,
  type AssistantDraftContext,
} from "../../api/client";
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
  "Resume ma semaine d'entrainement.",
  "Que dois-je surveiller sur mon poids ?",
  "Comment interpretes-tu ma derniere seance ?",
  "Aide-moi a comprendre ma nutrition du jour.",
  "Quelle est la prochaine chose utile a faire ?",
];

type AssistantHistoryItem = {
  content: string;
  role: "user" | "assistant";
};

const HISTORY_STORAGE_KEY = "assistant_chat_history";
const MAX_HISTORY_ITEMS = 20;

function assistantReply(draft: AssistantDraft) {
  return draft.reply?.trim() || draft.summary;
}

function ChatBubble({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[84%] rounded-[1.5rem] px-4 py-3 shadow-lg ${
          isUser
            ? "rounded-br-sm bg-emerald-300 text-emerald-950"
            : "rounded-bl-sm border border-white/10 bg-white/[0.06] text-stone-50"
        }`}
      >
        <p
          className={`mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] ${
            isUser ? "text-emerald-900/70" : "text-emerald-100"
          }`}
        >
          {isUser ? "Toi" : "IA"}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[1.5rem] rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-3 text-stone-200 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 [animation-delay:240ms]" />
          <span className="ml-2 text-sm">L'IA reflechit...</span>
        </div>
      </div>
    </div>
  );
}

export function AssistantChatbox({
  isAuthBypassEnabled,
  onApplyDraft,
  resource,
}: AssistantChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
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
  const [isLoading, setIsLoading] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView?.({
      block: "end",
      behavior: "smooth",
    });
  }, [history, isLoading, isOpen]);

  function appendHistory(items: AssistantHistoryItem[]) {
    setHistory((current) =>
      [...current, ...items].slice(-MAX_HISTORY_ITEMS),
    );
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isAuthBypassEnabled || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.createAssistantDraft({
        context: contextByResource[resource],
        history: history.slice(-12),
        message: trimmedMessage,
      });

      appendHistory([
        { content: trimmedMessage, role: "user" },
        { content: assistantReply(result), role: "assistant" },
      ]);
      setMessage("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible de charger la reponse de l'assistant",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isBusy = isLoading;

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-md md:bottom-6 md:right-6">
      {isOpen && (
        <div className="mb-3 overflow-hidden rounded-[2rem] border border-emerald-100/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(8,15,24,0.98)_100%)] text-stone-50 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <div className="relative isolate overflow-hidden border-b border-white/10 px-4 py-4">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-lime-200/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-emerald-200">
                  Assistant IA
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Chat box
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-300">
                  Pose une question, demande un resume ou une explication. Je
                  reponds dans le fil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-stone-200 transition hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto px-3 py-4">
            {history.length === 0 ? (
              <>
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm leading-relaxed text-stone-200">
                    Je peux resumer ta semaine, t'aider a comprendre tes
                    donnees ou t'orienter vers la bonne section.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setMessage(example)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-[0.72rem] text-stone-200 transition hover:bg-white/10"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
                {isBusy && <div className="mt-3"><TypingBubble /></div>}
              </>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <ChatBubble
                    key={`${item.role}-${index}-${item.content}`}
                    content={item.content}
                    role={item.role}
                  />
                ))}
                {isBusy && <TypingBubble />}
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          <div className="border-t border-white/10 px-3 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={`composer-${example}`}
                  type="button"
                  onClick={() => setMessage(example)}
                  disabled={isAuthBypassEnabled || isBusy}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-[0.7rem] text-stone-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>

            <form className="space-y-3" onSubmit={submit}>
              <textarea
                className="min-h-24 w-full resize-none rounded-[1.5rem] border border-white/10 bg-white/95 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20 disabled:cursor-not-allowed disabled:bg-stone-100"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ex: que peux-tu me dire sur ma semaine ?"
                disabled={isAuthBypassEnabled || isBusy}
              />
              <button
                type="submit"
                disabled={
                  isAuthBypassEnabled ||
                  isBusy ||
                  message.trim().length < 3
                }
                className="flex w-full items-center justify-center rounded-[1.25rem] bg-emerald-300 px-4 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/30 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? "Je reflechis..." : "Envoyer"}
              </button>
            </form>

            {isAuthBypassEnabled && (
              <p className="mt-3 rounded-[1.25rem] border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                Le mode bypass est actif: connecte-toi avec un JWT pour utiliser
                l'assistant.
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-[1.25rem] border border-red-300/30 bg-red-300/10 px-3 py-2 text-xs text-red-100">
                {error}
              </p>
            )}
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
        Chat IA
      </button>
    </aside>
  );
}
