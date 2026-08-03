import { FormEvent, useState } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { SuiviSportifBrand } from "../suivi-sportif-brand";

type AuthMode = "login" | "register";

const COOKIE_POLICY_PATH = "/suivi-sportif/politique-cookies";
const AUTH_INPUT_CLASS = "sport-input mt-2";

export function SuiviSportifLoadingScreen() {
  return (
    <main className="site-sport-grid grid min-h-screen place-items-center px-6 text-[#2b241e]">
      <div className="text-center">
        <SuiviSportifBrand />
        <svg
          viewBox="0 0 64 64"
          role="status"
          aria-label="Chargement du profil"
          className="mx-auto mt-10 h-20 w-20 -rotate-90 animate-spin"
        >
          <defs>
            <linearGradient id="loading-energy" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#ff7a54" />
              <stop offset="1" stopColor="#ffb648" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="24" fill="none" stroke="#f0e3d6" strokeWidth="7" />
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="none"
            stroke="url(#loading-energy)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="105 46"
          />
        </svg>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9c8f83]">
          Chargement du profil
        </p>
      </div>
    </main>
  );
}

export function SuiviSportifAuthScreen() {
  const { clearError, error, isLoading, login, register } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const title = mode === "login" ? "Connexion" : "Inscription";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (mode === "login") {
        await login(email, password);
        return;
      }

      await register(
        name,
        email,
        password,
        dateOfBirth ? new Date(`${dateOfBirth}T00:00:00.000Z`).toISOString() : null,
      );
    } catch {
      return;
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    clearError();
    setMode(nextMode);
  }

  return (
    <main className="site-sport-grid relative min-h-screen overflow-hidden bg-[#fff8f2] text-[#2b241e]">
      <div
        aria-hidden="true"
        className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#ffb648]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[#ff7a54]/15 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-screen max-w-[86rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between px-6 py-7 sm:px-10 lg:px-14 lg:py-10">
          <SuiviSportifBrand />

          <div className="max-w-2xl py-14 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff7a54]">
              Ton espace de progression
            </p>
            <h1 className="site-display mt-5 text-6xl font-bold leading-[0.9] tracking-[-0.035em] sm:text-7xl lg:text-8xl">
              Avance à
              <br />
              <span className="bg-[linear-gradient(135deg,#ff7a54,#ffb648)] bg-clip-text text-transparent">
                ton rythme.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#806f61]">
              Tes séances, ta nutrition et tes mesures réunies dans un tableau
              de bord chaleureux, clair et fait pour durer.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["01", "Séances"],
              ["02", "Nutrition"],
              ["03", "Corps"],
            ].map(([index, label]) => (
              <div key={label} className="rounded-[16px] bg-white/75 px-3 py-4 shadow-[0_2px_8px_rgba(43,36,30,0.04)]">
                <span className="site-display text-sm font-bold text-[#ff7a54]">{index}</span>
                <span className="mt-1 block text-xs font-semibold text-[#665b51]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="panel w-full p-6 shadow-[0_18px_50px_rgba(255,122,84,0.13)] sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#ff7a54]">
                  Accès membre
                </p>
                <h2 className="site-display mt-2 text-4xl font-bold leading-none">
                  {title}
                </h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff0e6] text-lg">
                👋
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 rounded-full bg-[#fdf6ef] p-1">
              {(["login", "register"] as AuthMode[]).map((authMode) => (
                <button
                  key={authMode}
                  type="button"
                  onClick={() => handleModeChange(authMode)}
                  className={`rounded-full px-3 py-3 text-xs font-semibold transition ${
                    mode === authMode
                      ? "bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-sm"
                      : "text-[#806f61] hover:text-[#2b241e]"
                  }`}
                >
                  {authMode === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              {mode === "register" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#665b51]">
                    Nom
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      autoComplete="name"
                      required
                      className={AUTH_INPUT_CLASS}
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#665b51]">
                    Date de naissance
                    <input
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      type="date"
                      className={AUTH_INPUT_CLASS}
                    />
                  </label>
                </div>
              )}

              <label className="mt-5 block text-xs font-semibold text-[#665b51]">
                E-mail
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className={AUTH_INPUT_CLASS}
                />
              </label>

              <label className="mt-5 block text-xs font-semibold text-[#665b51]">
                Mot de passe
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  className={AUTH_INPUT_CLASS}
                />
              </label>

              {error && (
                <p className="mt-5 rounded-[14px] border border-[#ffd4ca] bg-[#fff1ed] px-4 py-3 text-sm font-medium text-[#a84432]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="sport-primary-button mt-7 w-full py-3.5"
              >
                {isLoading ? "Traitement en cours…" : title}
              </button>

              <p className="mt-5 text-xs leading-5 text-[#9c8f83]">
                En continuant, tu peux consulter notre{" "}
                <a
                  href={COOKIE_POLICY_PATH}
                  className="font-semibold text-[#e85f3c] underline decoration-[#ffb648] decoration-2 underline-offset-4"
                >
                  politique cookies
                </a>
                .
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
