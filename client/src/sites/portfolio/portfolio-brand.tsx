export function PortfolioBrand() {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 grid-cols-2 border border-[#17322e] p-1"
      >
        <span className="border-b border-r border-[#17322e]" />
        <span className="border-b border-[#17322e]" />
        <span className="border-r border-[#17322e]" />
        <span className="bg-[#d84a32]" />
      </span>
      <span>
        <span className="site-display block text-lg font-semibold leading-none">
          Portfolio
        </span>
        <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#17322e]/55">
          Projets choisis / 2026
        </span>
      </span>
    </span>
  );
}
