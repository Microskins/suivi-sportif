import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "./stores/authStore";

type AuthMode = "login" | "register";

export default function App() {
  const {
    user,
    isAuthenticated,
    isInitializing,
    isLoading,
    error,
    initializeAuth,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  const title = useMemo(() => {
    return mode === "login" ? "Connexion" : "Inscription";
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (mode === "login") {
        await login(email, password);
        return;
      }

      await register(name, email, password);
    } catch {
      return;
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    clearError();
    setMode(nextMode);
  }

  if (isInitializing) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <p className="text-sm font-medium">Chargement du profil...</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated && user) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <section className="mx-auto max-w-2xl px-6 py-10">
          <div className="rounded border border-slate-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Connecté
            </p>
            <h1 className="mt-2 text-2xl font-bold">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={logout}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-bold">Suivi Sportif</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connecte-toi pour gérer tes entraînements.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded border border-slate-300 bg-white p-1">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={`rounded px-3 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("register")}
            className={`rounded px-3 py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Inscription
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded border border-slate-300 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">{title}</h2>

          {mode === "register" && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Nom
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                autoComplete="name"
                required
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
          )}

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Mot de passe
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          {error && (
            <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Traitement..." : title}
          </button>
        </form>
      </section>
    </main>
  );
}
