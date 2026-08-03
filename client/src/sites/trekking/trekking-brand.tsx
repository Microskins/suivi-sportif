export function TrekkingBrand() {
  return (
    <span className="inline-flex items-center gap-3 text-white">
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-[#332f26]/30 backdrop-blur-sm"
      >
        <span className="absolute inset-[5px] rounded-full border border-white/45" />
        <span className="absolute inset-[10px] rounded-full border border-white/30" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#f1e2c4]" />
      </span>
      <span>
        <span className="site-display block text-xl font-semibold leading-none">
          Trekking
        </span>
        <span className="site-label mt-1 block text-[0.56rem] font-medium uppercase tracking-[0.16em] text-white/75">
          Carnets de marche
        </span>
      </span>
    </span>
  );
}
