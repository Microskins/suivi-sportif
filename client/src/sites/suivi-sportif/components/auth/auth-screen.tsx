import { FormEvent, useState } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { SuiviSportifBrand } from "../suivi-sportif-brand";

type AuthMode = "login" | "register";

const COOKIE_POLICY_PATH = "/suivi-sportif/politique-cookies";
const AUTH_INPUT_CLASS =
  "mt-2 block w-full border border-[#bdc8b8] bg-white px-4 py-3 text-sm text-[#071411] outline-none transition placeholder:text-[#718076] focus:border-[#071411] focus:ring-2 focus:ring-[#d8ff63]";
const LOADING_BAR_HEIGHT_CLASSES = ["h-3", "h-6", "h-4", "h-8", "h-5", "h-7"];

export function SuiviSportifLoadingScreen() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071411] px-6 text-[#eef5eb]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(216,255,99,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(216,255,99,0.05)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <div className="relative text-center">
        <SuiviSportifBrand />
        <div className="mx-auto mt-10 flex w-28 items-end justify-center gap-1">
          {LOADING_BAR_HEIGHT_CLASSES.map((heightClass) => (
            <span
              key={heightClass}
              className={`w-2 animate-pulse bg-[#d8ff63] ${heightClass}`}
            />
          ))}
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#9aac9f]">
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
    <main className="relative min-h-screen overflow-hidden bg-[#071411] text-[#eef5eb]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(216,255,99,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(216,255,99,0.045)_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <SuiviSportifBrand />

          <div className="max-w-2xl py-16 lg:py-20">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#64e8d8]">
              Systeme personnel de progression
            </p>
            <h1 className="site-display mt-6 text-6xl font-black uppercase leading-[0.82] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Entraine.
              <br />
              <span className="text-[#d8ff63]">Mesure.</span>
              <br />
              Ajuste.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#b9c8bd]">
              Un poste de pilotage pour relier tes seances, ta nutrition et les
              signaux reels de ta progression.
            </p>
          </div>

          <div className="grid grid-cols-3 border-y border-[#294238] text-center">
            {["Force", "Nutrition", "Corps"].map((label, index) => (
              <div
                key={label}
                className={`px-2 py-4 ${index > 0 ? "border-l border-[#294238]" : ""}`}
              >
                <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#8fa196]">
                  0{index + 1}
                </span>
                <span className="mt-1 block text-sm font-bold uppercase tracking-[0.12em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center bg-[#d8ff63] px-6 py-12 text-[#071411] sm:px-10 lg:px-14">
          <div className="w-full border border-[#071411] bg-[#f3f5ec] p-6 shadow-[12px_12px_0_#071411] sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-[#536159]">
                  Acces membre / 01
                </p>
                <h2 className="site-display mt-2 text-4xl font-black uppercase leading-none">
                  {title}
                </h2>
              </div>
              <span className="h-3 w-3 bg-[#64e8d8] ring-4 ring-[#071411]" />
            </div>

            <div className="mt-8 grid grid-cols-2 border border-[#071411] bg-white">
              {(["login", "register"] as AuthMode[]).map((authMode) => (
                <button
                  key={authMode}
                  type="button"
                  onClick={() => handleModeChange(authMode)}
                  className={`px-3 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                    mode === authMode
                      ? "bg-[#071411] text-[#d8ff63]"
                      : "text-[#536159] hover:bg-[#e9eee5]"
                  }`}
                >
                  {authMode === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              {mode === "register" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-black uppercase tracking-[0.14em]">
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
                  <label className="text-xs font-black uppercase tracking-[0.14em]">
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

              <label className="mt-5 block text-xs font-black uppercase tracking-[0.14em]">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className={AUTH_INPUT_CLASS}
                />
              </label>

              <label className="mt-5 block text-xs font-black uppercase tracking-[0.14em]">
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
                <p className="mt-5 border border-[#b7312c] bg-[#fff1ee] px-4 py-3 text-sm font-semibold text-[#8d241f]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-7 w-full border border-[#071411] bg-[#071411] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#d8ff63] transition hover:bg-[#153229] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Traitement en cours..." : title}
              </button>

              <p className="mt-5 text-xs leading-5 text-[#647169]">
                En continuant, tu peux consulter notre{" "}
                <a
                  href={COOKIE_POLICY_PATH}
                  className="font-black text-[#071411] underline decoration-[#64e8d8] decoration-2 underline-offset-4"
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
