export function SuiviSportifBrand({ compact = false }: { compact?: boolean }) {
  const markClass = compact ? "h-10 w-10" : "h-12 w-12";

  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`relative grid place-items-center border-2 border-[#d8ff63] ${markClass}`}
      >
        <span className="site-display text-lg font-black tracking-[-0.08em] text-[#eef5eb]">
          SS
        </span>
        <span className="absolute -bottom-1 left-1 h-1 w-4 bg-[#64e8d8]" />
      </span>
      <span>
        <span className="site-display block text-lg font-black uppercase leading-none tracking-[0.02em] text-[#eef5eb]">
          Suivi Sportif
        </span>
        <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[#d8ff63]">
          Progression system / 01
        </span>
      </span>
    </span>
  );
}
