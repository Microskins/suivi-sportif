import type { ReactNode } from "react";

export const inputClass =
  "block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-emerald-700";
export const buttonClass =
  "inline-flex min-h-10 items-center justify-center rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 disabled:cursor-not-allowed disabled:opacity-60";
export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600";
export const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50";
export const dragHandleButtonClass =
  "inline-flex h-9 w-9 cursor-grab items-center justify-center rounded border border-dashed border-slate-400 bg-slate-50 text-slate-700 hover:bg-slate-100 active:cursor-grabbing";
export const viewButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";
export const activeViewButtonClass =
  `${viewButtonClass} border-emerald-700 bg-emerald-700 text-white shadow-sm`;
export const inactiveViewButtonClass =
  `${viewButtonClass} border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50`;
export const itemCardClass =
  "rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow";

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
      {label}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export function MacroInput({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </Field>
  );
}

export function FormActions({
  isSaving,
  onCancel,
}: {
  isSaving: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
      <button type="button" className={secondaryButtonClass} onClick={onCancel}>
        Annuler
      </button>
      <button type="submit" disabled={isSaving} className={buttonClass}>
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}
