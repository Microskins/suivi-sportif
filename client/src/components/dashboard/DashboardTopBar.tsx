import { secondaryButtonClass } from "./shared";

export function DashboardTopBar({
  userName,
  userEmail,
  isAuthBypassEnabled,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  isAuthBypassEnabled: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="rounded border border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Suivi Sportif</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-950">{userName}</h1>
          <p className="mt-1 text-sm text-neutral-600">{userEmail}</p>
          {isAuthBypassEnabled && (
            <p className="mt-2 inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
              Mode bypass actif
            </p>
          )}
        </div>
        <button type="button" onClick={onLogout} className={secondaryButtonClass}>Se deconnecter</button>
      </div>
    </div>
  );
}
