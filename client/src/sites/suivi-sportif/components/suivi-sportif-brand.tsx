export function SuiviSportifBrand({ compact = false }: { compact?: boolean }) {
  const markClass = compact ? "h-10 w-10" : "h-12 w-12";

  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`relative grid place-items-center rounded-[14px] bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-[0_6px_14px_rgba(255,122,84,0.22)] ${markClass}`}
      >
        <span className="site-display text-lg font-bold tracking-[-0.08em]">
          SS
        </span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#5fb894]" />
      </span>
      <span>
        <span className="site-display block text-lg font-bold leading-none text-[#2b241e]">
          Suivi Sportif
        </span>
        <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#ff7a54]">
          Ton rythme, tes progrès
        </span>
      </span>
    </span>
  );
}
