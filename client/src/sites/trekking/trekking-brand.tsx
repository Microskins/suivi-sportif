export function TrekkingBrand() {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-[#95d5a8]/70"
      >
        <span className="absolute inset-[5px] rounded-full border border-[#95d5a8]/45" />
        <span className="absolute inset-[10px] rounded-full border border-[#95d5a8]/30" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#cfe895]" />
      </span>
      <span>
        <span className="site-display block text-lg font-semibold leading-none text-[#f4efdf]">
          Trekking
        </span>
        <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#95d5a8]">
          Carnets de marche
        </span>
      </span>
    </span>
  );
}
