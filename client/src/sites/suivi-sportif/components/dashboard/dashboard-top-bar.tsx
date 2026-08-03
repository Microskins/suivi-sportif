import { SuiviSportifBrand } from "../suivi-sportif-brand";

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
    <div>
      <SuiviSportifBrand compact />
      <div className="mt-6 rounded-[16px] bg-[#fdf6ef] p-3">
        <p className="site-display truncate text-base font-bold text-[#2b241e]">
          {userName}
        </p>
        <p className="mt-1 truncate text-[0.68rem] text-[#9c8f83]">
          {userEmail}
        </p>
        {isAuthBypassEnabled && (
          <p className="mt-2 inline-flex rounded-full bg-[#fff0e6] px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#e85f3c]">
            Mode bypass
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 w-full rounded-full border border-[#f0e3d6] px-3 py-2 text-xs font-semibold text-[#806f61] transition hover:border-[#ffb899] hover:bg-[#fff8f2] hover:text-[#e85f3c]"
      >
        Se déconnecter
      </button>
    </div>
  );
}
