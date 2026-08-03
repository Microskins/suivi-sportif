export function PortfolioBrand() {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="site-display flex h-11 w-11 items-center justify-center border-2 border-[#1b2a3d] bg-[#a63d2f] text-2xl font-bold text-[#efe7d8]"
      >
        TC
      </span>
      <span>
        <span className="site-display block text-xl font-bold uppercase leading-none tracking-[-0.01em]">
          Portfolio
        </span>
        <span className="site-label mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#5b6474]">
          Projets choisis
        </span>
      </span>
    </span>
  );
}
