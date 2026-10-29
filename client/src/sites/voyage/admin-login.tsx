import type { FormEvent } from "react";
import { useState } from "react";
import { adminErrorMessage, login } from "./admin-api";
import { ErrorAlert, TextField, buttonClass } from "./admin-ui";

export function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login(email.trim(), password);
      onLoggedIn();
    } catch (failure) {
      setError(adminErrorMessage(failure));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[12px] border border-[#dfe4ea] bg-white p-6 sm:p-8">
      <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
        Accès réservé
      </p>
      <h1 className="site-display mt-2 text-3xl font-semibold">
        Administration des voyages
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
        Connectez-vous avec un compte administrateur du site Voyage.
      </p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <TextField
          label="E-mail"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <ErrorAlert>{error}</ErrorAlert>
        <button
          type="submit"
          className={`${buttonClass.primary} w-full`}
          disabled={pending}
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
