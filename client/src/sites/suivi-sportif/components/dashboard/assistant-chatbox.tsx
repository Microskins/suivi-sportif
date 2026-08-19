import { FormEvent, useEffect, useRef, useState } from "react";
import {
  api,
  type AssistantDraft,
  type AssistantDraftContext,
} from "../../api/client";
import type { DashboardResource } from "./resource-header";

type AssistantChatboxProps = {
  isAuthBypassEnabled: boolean;
  // Conserve volontairement mais non appele: depuis le plan 066 ("chat box
  // classique sans mutations"), la chatbox n'applique plus de brouillon.
  // Les tests verifient explicitement que ce callback n'est jamais invoque.
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
  "Résume ma semaine d'entraînement.",
  "Que dois-je surveiller sur mon poids ?",
  "Comment interprètes-tu ma dernière séance ?",
  "Aide-moi à comprendre ma nutrition du jour.",
  "Quelle est la prochaine chose utile à faire ?",
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
        className={`max-w-[84%] rounded-[1.5rem] px-4 py-3 ${
          isUser
            ? "rounded-br-sm bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white"
            : "rounded-bl-sm bg-[#fdf6ef] text-[#2b241e]"
        }`}
      >
        <p
          className={`mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] ${
            isUser ? "text-white/75" : "text-[#ff7a54]"
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
      <div className="rounded-[1.5rem] rounded-bl-sm bg-[#fdf6ef] px-4 py-3 text-[var(--site-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff7a54]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff9a50] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#ffb648] [animation-delay:240ms]" />
          <span className="ml-2 text-sm">L&apos;IA réfléchit…</span>
        </div>
      </div>
    </div>
  );
}

export function AssistantChatbox({
  isAuthBypassEnabled,
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
          : "Impossible de charger la réponse de l’assistant",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isBusy = isLoading;

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-md md:bottom-6 md:right-6">
      {isOpen && (
        <div className="mb-3 overflow-hidden rounded-[24px] bg-white text-[#2b241e] shadow-[0_24px_70px_rgba(43,36,30,0.2)]">
          <div className="relative isolate overflow-hidden border-b border-[#f0e3d6] px-4 py-4">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#ff7a54]/15 blur-3xl" />
            <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[#ffb648]/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ff7a54]">
                  Assistant IA
                </p>
                <h2 className="site-display mt-1 text-lg font-bold text-[#2b241e]">
                  Coach de poche
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--site-muted)]">
                  Pose une question, demande un résumé ou une explication. Je
                  réponds dans le fil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sport-secondary-button min-h-8 px-3 py-1 text-xs"
              >
                Fermer
              </button>
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto px-3 py-4">
            {history.length === 0 ? (
              <>
                <div className="rounded-[18px] bg-[#fdf6ef] p-4">
                  <p className="text-sm leading-relaxed text-[#665b51]">
                    Je peux résumer ta semaine, t&apos;aider à comprendre tes
                    données ou t&apos;orienter vers la bonne section.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setMessage(example)}
                        className="rounded-full border border-[#f0e3d6] bg-white px-3 py-1.5 text-left text-[0.72rem] text-[var(--site-muted)] transition hover:border-[#ffb899] hover:text-[var(--site-accent-text)]"
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

          <div className="border-t border-[#f0e3d6] px-3 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={`composer-${example}`}
                  type="button"
                  onClick={() => setMessage(example)}
                  disabled={isAuthBypassEnabled || isBusy}
                  className="rounded-full border border-[#f0e3d6] bg-white px-3 py-1.5 text-left text-[0.7rem] text-[var(--site-muted)] transition hover:border-[#ffb899] hover:text-[var(--site-accent-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>

            <form className="space-y-3" onSubmit={submit}>
              <textarea
                className="sport-input min-h-24 resize-none rounded-[18px]"
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
                className="sport-primary-button w-full py-3"
              >
                {isBusy ? "Je réfléchis…" : "Envoyer"}
              </button>
            </form>

            {isAuthBypassEnabled && (
              <p className="mt-3 rounded-[14px] bg-[#fff5e3] px-3 py-2 text-xs text-[#9b681b]">
                Le mode bypass est actif : connecte-toi avec un JWT pour utiliser
                l&apos;assistant.
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-[14px] bg-[#fff1ed] px-3 py-2 text-xs text-[#a84432]">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="ml-auto flex min-h-14 items-center gap-3 rounded-full bg-[linear-gradient(135deg,#ff7a54,#ffb648)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(255,122,84,0.3)] transition hover:-translate-y-0.5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--site-accent-text)]">
          IA
        </span>
        Chat IA
      </button>
    </aside>
  );
}
