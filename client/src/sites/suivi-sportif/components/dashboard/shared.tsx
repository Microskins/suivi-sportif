import { useEffect, useState, type ReactNode } from "react";

export const inputClass =
  "sport-input";
export const buttonClass =
  "sport-primary-button";
export const secondaryButtonClass =
  "sport-secondary-button";
export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-[#ffd4ca] bg-white px-4 py-2 text-sm font-medium text-[#b64b36] transition hover:bg-[#fff1ed]";
export const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f0e3d6] bg-white text-sm font-semibold text-[#665b51] hover:border-[#ffb899] hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-50";
export const dragHandleButtonClass =
  "inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-full border border-[#f0e3d6] bg-[#fdf6ef] text-[var(--site-muted)] hover:border-[#ffb899] active:cursor-grabbing";
export const viewButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
export const activeViewButtonClass =
  `${viewButtonClass} border-transparent bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-sm`;
export const inactiveViewButtonClass =
  `${viewButtonClass} border-[#f0e3d6] bg-white text-[#665b51] hover:bg-[#fff8f2]`;
export const itemCardClass =
  "rounded-[18px] bg-white p-4 shadow-[0_2px_8px_rgba(43,36,30,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,36,30,0.08)]";

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-[14px] border border-[#ffd4ca] bg-[#fff1ed] px-4 py-3 text-sm text-[#a84432]">
      {message}
    </p>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[16px] bg-[#fdf6ef] px-4 py-8 text-center text-sm text-[var(--site-muted)]">
      {label}
    </div>
  );
}

export function ExerciseImagePreview({
  imageUrl,
  label,
  className = "h-28 w-28",
}: {
  imageUrl: string | null;
  label: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl || imageFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded-[16px] bg-[#fdf6ef] text-xs text-[var(--site-muted)] ${className}`}
      >
        {imageUrl ? "Image indisponible" : "Aucune image"}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Illustration de ${label}`}
      className={`rounded-[16px] object-cover object-[center_56%] ${className}`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
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
    <label className="block text-sm font-medium text-[#665b51]">
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
    <div className="flex flex-col-reverse gap-3 border-t border-[#f0e3d6] pt-4 sm:flex-row sm:justify-end">
      <button type="button" className={secondaryButtonClass} onClick={onCancel}>
        Annuler
      </button>
      <button type="submit" disabled={isSaving} className={buttonClass}>
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

export function ItemActions<T>({
  item,
  onEdit,
  onDelete,
}: {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={secondaryButtonClass} onClick={() => onEdit(item)}>
        Modifier
      </button>
      <button type="button" className={dangerButtonClass} onClick={() => onDelete(item)}>
        Supprimer
      </button>
    </div>
  );
}
