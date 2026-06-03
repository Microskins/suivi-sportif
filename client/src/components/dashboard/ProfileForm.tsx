import { FormEvent, useEffect, useState } from "react";
import { buttonClass, ErrorBox, Field, inputClass } from "./shared";

type ProfileFormProps = {
  userName: string;
  userEmail: string;
  userDateOfBirth: string | null;
  isSaving: boolean;
  error: string | null;
  onSubmit: (data: {
    email?: string;
    dateOfBirth?: string | null;
    password?: string;
    currentPassword?: string;
  }) => Promise<void>;
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function dateToIso(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function ProfileForm({
  userName,
  userEmail,
  userDateOfBirth,
  isSaving,
  error,
  onSubmit,
}: ProfileFormProps) {
  const [email, setEmail] = useState(userEmail);
  const [dateOfBirth, setDateOfBirth] = useState(toInputDate(userDateOfBirth));
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const sensitiveChange = email.trim() !== userEmail || password.trim().length > 0;

  useEffect(() => {
    setEmail(userEmail);
    setDateOfBirth(toInputDate(userDateOfBirth));
    setPassword("");
    setCurrentPassword("");
  }, [userEmail, userDateOfBirth]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    try {
      await onSubmit({
        ...(email.trim() !== userEmail ? { email } : {}),
        dateOfBirth: dateOfBirth ? dateToIso(dateOfBirth) : null,
        ...(password.trim() ? { password } : {}),
        ...(sensitiveChange ? { currentPassword } : {}),
      });
      setPassword("");
      setCurrentPassword("");
      setSuccessMessage("Profil mis a jour.");
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Profil</h2>
        <p className="mt-1 text-sm text-slate-600">{userName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email">
          <input
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Date de naissance">
          <input
            className={inputClass}
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            type="date"
          />
        </Field>
      </div>

      <Field label="Nouveau mot de passe">
        <input
          className={inputClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Laisser vide pour ne pas changer"
        />
      </Field>

      {sensitiveChange && (
        <div className="rounded border border-amber-200 bg-amber-50/80 p-3">
          <p className="text-sm font-semibold text-amber-950">Confirmation requise</p>
          <p className="mt-1 text-xs text-amber-800/80">
            Le mot de passe actuel est demande pour changer l'email ou definir un nouveau mot de passe.
          </p>
          <div className="mt-3">
            <Field label="Mot de passe actuel">
              <input
                className={`${inputClass} bg-white`}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}
      <ErrorBox message={error} />

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" disabled={isSaving} className={buttonClass}>
          {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </div>
    </form>
  );
}
