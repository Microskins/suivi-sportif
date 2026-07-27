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
    <div className="border border-[#294238] bg-[#071411] p-5 text-[#eef5eb] shadow-[6px_6px_0_#d8ff63]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SuiviSportifBrand compact />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:text-right">
            <p className="site-display text-2xl font-black uppercase leading-none">
              {userName}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-[#9aac9f]">
              {userEmail}
            </p>
          </div>
          {isAuthBypassEnabled && (
            <p className="inline-flex border border-[#d8ff63]/50 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-[#d8ff63]">
              Bypass
            </p>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="border border-[#536c61] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#eef5eb] transition hover:border-[#d8ff63] hover:text-[#d8ff63]"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
