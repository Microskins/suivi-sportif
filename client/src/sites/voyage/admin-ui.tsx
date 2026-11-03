// Briques de formulaire de l'admin Voyage: sobres, chaque champ porte son
// label et, le cas echeant, son erreur reliee par aria-describedby.
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useId, useRef, useState } from "react";

// Rouge d'erreur: 6,5:1 sur blanc, 5,9:1 sur le fond rose de l'alerte.
const DANGER = "text-[#b42318]";

export const inputClass =
  "mt-1.5 block w-full rounded-[8px] border border-[#dfe4ea] bg-white px-3 py-2 text-sm text-[#0f1b2b] transition hover:border-[#9aa4b1] aria-[invalid=true]:border-[#b42318] disabled:bg-[#f4f6f8]";

export const labelClass =
  "site-label block text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--site-muted)]";

export const buttonClass = {
  primary:
    "inline-flex min-h-10 items-center justify-center rounded-full bg-[#1c4ed8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1740b4] disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center rounded-full border border-[#c9d1db] bg-white px-4 py-2 text-sm font-semibold text-[#0f1b2b] transition hover:border-[#0f1b2b] disabled:cursor-not-allowed disabled:opacity-60",
  danger: `inline-flex min-h-10 items-center justify-center rounded-full border border-[#f1c6c2] bg-white px-4 py-2 text-sm font-semibold ${DANGER} transition hover:border-[#b42318] disabled:cursor-not-allowed disabled:opacity-60`,
  small:
    "inline-flex min-h-8 items-center justify-center rounded-full border border-[#c9d1db] bg-white px-3 py-1 text-xs font-semibold text-[#0f1b2b] transition hover:border-[#0f1b2b] disabled:cursor-not-allowed disabled:opacity-50",
  smallDanger: `inline-flex min-h-8 items-center justify-center rounded-full border border-[#f1c6c2] bg-white px-3 py-1 text-xs font-semibold ${DANGER} transition hover:border-[#b42318] disabled:cursor-not-allowed disabled:opacity-50`,
};

type BaseFieldProps = {
  className?: string;
  error?: string;
  hint?: ReactNode;
  label: ReactNode;
};

function FieldShell({
  children,
  className,
  error,
  errorId,
  hint,
  hintId,
  id,
  label,
}: BaseFieldProps & {
  children: ReactNode;
  errorId: string;
  hintId: string;
  id: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && (
        <p
          id={hintId}
          className="mt-1 text-xs leading-5 text-[var(--site-muted)]"
        >
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={`mt-1 text-xs font-medium ${DANGER}`}>
          {error}
        </p>
      )}
    </div>
  );
}

function useFieldIds(error?: string, hint?: ReactNode) {
  const id = useId();
  const errorId = `${id}-erreur`;
  const hintId = `${id}-aide`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;
  return {
    id,
    errorId,
    hintId,
    controlProps: {
      id,
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : undefined,
    },
  };
}

export function TextField({
  className,
  error,
  hint,
  label,
  ...input
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const { controlProps, ...ids } = useFieldIds(error, hint);
  return (
    <FieldShell {...{ className, error, hint, label }} {...ids}>
      <input className={inputClass} {...input} {...controlProps} />
    </FieldShell>
  );
}

export function TextAreaField({
  className,
  error,
  hint,
  label,
  ...textarea
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { controlProps, ...ids } = useFieldIds(error, hint);
  return (
    <FieldShell {...{ className, error, hint, label }} {...ids}>
      <textarea
        className={inputClass}
        rows={3}
        {...textarea}
        {...controlProps}
      />
    </FieldShell>
  );
}

export function SelectField({
  children,
  className,
  error,
  hint,
  label,
  ...select
}: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const { controlProps, ...ids } = useFieldIds(error, hint);
  return (
    <FieldShell {...{ className, error, hint, label }} {...ids}>
      <select className={inputClass} {...select} {...controlProps}>
        {children}
      </select>
    </FieldShell>
  );
}

export function ErrorAlert({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={`rounded-[8px] border border-[#f1c6c2] bg-[#fdf3f2] px-4 py-3 text-sm font-medium ${DANGER}`}
    >
      {children}
    </p>
  );
}

export function Panel({
  actions,
  children,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  title: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-[12px] border border-[#dfe4ea] bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="site-display text-xl font-semibold">
          {title}
        </h2>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Section d'une etape dans l'admin: un titre numerote, une ligne d'aide et
// ses champs sur un fond teinte, une couleur par section pour reperer d'un
// coup d'oeil ou l'on est. Pastilles en blanc sur fond fonce (>= 4,5:1).
const SECTION_TONES = {
  blue: {
    box: "border-[#c9d8fb] border-l-[#1c4ed8] bg-[#f6f8ff]",
    badge: "bg-[#1c4ed8]",
  },
  violet: {
    box: "border-[#ddd2fb] border-l-[#6d28d9] bg-[#faf8ff]",
    badge: "bg-[#6d28d9]",
  },
  rose: {
    box: "border-[#f5c6da] border-l-[#be185d] bg-[#fff7fa]",
    badge: "bg-[#be185d]",
  },
  orange: {
    box: "border-[#f2d3a7] border-l-[#b45309] bg-[#fffaf3]",
    badge: "bg-[#b45309]",
  },
  green: {
    box: "border-[#c4e8cc] border-l-[#15803d] bg-[#f4fbf5]",
    badge: "bg-[#15803d]",
  },
  // Albums photo: la sarcelle des randonnees et de leurs bulles.
  teal: {
    box: "border-[#b9e3e1] border-l-[#0f766e] bg-[#f3fbfa]",
    badge: "bg-[#0f766e]",
  },
} as const;

export type StageSectionTone = keyof typeof SECTION_TONES;

// Repliable d'un clic sur son titre: le contenu reste monte (une saisie en
// cours n'est pas perdue) et une section repliee se rouvre d'elle-meme si
// l'un de ses champs est signale invalide.
export function StageSection({
  children,
  defaultOpen = true,
  hint,
  number,
  title,
  tone,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  hint?: ReactNode;
  number: number;
  title: ReactNode;
  tone: StageSectionTone;
}) {
  const titleId = useId();
  const bodyId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const colors = SECTION_TONES[tone];

  useEffect(() => {
    if (!open && bodyRef.current?.querySelector('[aria-invalid="true"]')) {
      setOpen(true);
    }
  });

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-[10px] border border-l-4 ${open ? "p-4" : "px-4 py-2"} ${colors.box}`}
    >
      <h4 id={titleId} className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
          className="site-label flex min-h-8 w-full items-center gap-2 rounded-[6px] text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#0f1b2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1b2b]"
        >
          <span
            aria-hidden="true"
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.6rem] text-white ${colors.badge}`}
          >
            {number}
          </span>
          <span className="flex-1">{title}</span>
          <span
            aria-hidden="true"
            className={`text-sm leading-none text-[#3d4b5c] transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      </h4>
      <div id={bodyId} ref={bodyRef} hidden={!open}>
        {hint && (
          <p className="mt-1 text-xs leading-5 text-[#3d4b5c]">{hint}</p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}
