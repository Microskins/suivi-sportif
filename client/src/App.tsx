import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "./stores/authStore";
import { useExercisesStore } from "./stores/exercisesStore";
import { useWorkoutsStore } from "./stores/workoutsStore";

type AuthMode = "login" | "register";
type DashboardTab = "workouts" | "exercises";
const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

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
  const {
    workouts,
    isLoading: isWorkoutsLoading,
    error: workoutsError,
    fetchWorkouts,
  } = useWorkoutsStore();
  const {
    exercises,
    isLoading: isExercisesLoading,
    error: exercisesError,
    fetchExercises,
  } = useExercisesStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [tab, setTab] = useState<DashboardTab>("workouts");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void fetchWorkouts();
    void fetchExercises();
  }, [isAuthenticated, fetchWorkouts, fetchExercises]);

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
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Connecte
                </p>
                <h1 className="mt-2 text-2xl font-bold">{user.name}</h1>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                {isAuthBypassEnabled && (
                  <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                    Mode bypass actif (sans login/register ni API distante)
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Se deconnecter
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setTab("workouts")}
              className={`rounded px-3 py-2 text-sm font-medium ${
                tab === "workouts"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Seances
            </button>
            <button
              type="button"
              onClick={() => setTab("exercises")}
              className={`rounded px-3 py-2 text-sm font-medium ${
                tab === "exercises"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Exercices
            </button>
          </div>

          {tab === "workouts" && (
            <div className="mt-4 rounded border border-slate-300 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mes seances</h2>
                <button
                  type="button"
                  onClick={() => void fetchWorkouts()}
                  className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Rafraichir
                </button>
              </div>
              {isWorkoutsLoading && (
                <p className="text-sm text-slate-600">Chargement...</p>
              )}
              {!isWorkoutsLoading && workoutsError && (
                <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {workoutsError}
                </p>
              )}
              {!isWorkoutsLoading && !workoutsError && workouts.length === 0 && (
                <p className="text-sm text-slate-600">
                  Aucune seance pour le moment.
                </p>
              )}
              {!isWorkoutsLoading && workouts.length > 0 && (
                <ul className="space-y-3">
                  {workouts.map((workout) => (
                    <li
                      key={workout.id}
                      className="rounded border border-slate-200 p-4"
                    >
                      <p className="font-semibold">{workout.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(workout.date).toLocaleString("fr-FR")} -{" "}
                        {workout.duration} min
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "exercises" && (
            <div className="mt-4 rounded border border-slate-300 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Catalogue exercices</h2>
                <button
                  type="button"
                  onClick={() => void fetchExercises()}
                  className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Rafraichir
                </button>
              </div>
              {isExercisesLoading && (
                <p className="text-sm text-slate-600">Chargement...</p>
              )}
              {!isExercisesLoading && exercisesError && (
                <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {exercisesError}
                </p>
              )}
              {!isExercisesLoading &&
                !exercisesError &&
                exercises.length === 0 && (
                  <p className="text-sm text-slate-600">
                    Aucun exercice disponible.
                  </p>
                )}
              {!isExercisesLoading && exercises.length > 0 && (
                <ul className="grid gap-3 md:grid-cols-2">
                  {exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="rounded border border-slate-200 p-4"
                    >
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {exercise.muscleGroup} - {exercise.difficulty}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-bold">Suivi Sportif</h1>
        <p className="mt-1 text-sm text-slate-600">
          Connecte-toi pour gerer tes entrainements.
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
