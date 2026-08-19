type DashboardStatCardProps = {
  detail: string;
  label: string;
  progress?: number;
  ringId?: string;
  value: string;
};

function ProgressRing({
  progress,
  ringId,
}: {
  progress: number;
  ringId: string;
}) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <svg
      viewBox="0 0 42 42"
      role="img"
      aria-label={`${normalizedProgress}% de l’objectif`}
      className="h-16 w-16 -rotate-90"
    >
      <defs>
        <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff7a54" />
          <stop offset="1" stopColor="#ffb648" />
        </linearGradient>
      </defs>
      <circle
        cx="21"
        cy="21"
        r="16"
        fill="none"
        pathLength="100"
        stroke="#f4e9de"
        strokeWidth="4"
      />
      <circle
        cx="21"
        cy="21"
        r="16"
        fill="none"
        pathLength="100"
        stroke={`url(#${ringId})`}
        strokeDasharray={`${normalizedProgress} ${100 - normalizedProgress}`}
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function DashboardStatCard({
  detail,
  label,
  progress,
  ringId = "energy-ring",
  value,
}: DashboardStatCardProps) {
  return (
    <article className="panel flex min-h-36 items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(43,36,30,0.08)]">
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--site-muted)]">
          {label}
        </p>
        <p className="site-display mt-2 break-words text-2xl font-bold text-[#2b241e]">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--site-muted)]">{detail}</p>
      </div>
      {progress !== undefined && (
        <div className="relative shrink-0">
          <ProgressRing progress={progress} ringId={ringId} />
          <span className="site-display absolute inset-0 grid place-items-center text-xs font-bold text-[var(--site-accent-text)]">
            {progress}%
          </span>
        </div>
      )}
    </article>
  );
}
