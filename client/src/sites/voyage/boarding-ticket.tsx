type BoardingTicketProps = {
  actionHref: string;
  actionLabel: string;
  arrivalCode: string;
  departureCode: string;
  description: string;
  eyebrow: string;
  headingLevel?: "h1" | "h2";
  status: "realise" | "a-venir";
  stubLabel: string;
  title: string;
};

function RouteArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-[#1c4ed8]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function BoardingTicket({
  actionHref,
  actionLabel,
  arrivalCode,
  departureCode,
  description,
  eyebrow,
  headingLevel = "h2",
  status,
  stubLabel,
  title,
}: BoardingTicketProps) {
  const isUpcoming = status === "a-venir";
  const Heading = headingLevel;

  return (
    <article className="voyage-ticket grid overflow-hidden rounded-xl border border-[#dfe4ea] bg-white md:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#6b7684]">
            {eyebrow}
          </p>
          <span
            className={`site-label rounded-full px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.11em] ${
              isUpcoming
                ? "bg-[#fff2df] text-[#b96d10]"
                : "bg-[#eaf0ff] text-[#1c4ed8]"
            }`}
          >
            {isUpcoming ? "À venir" : "Réalisé"}
          </span>
        </div>

        <Heading className="site-display mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {title}
        </Heading>
        <p className="mt-3 max-w-2xl leading-7 text-[#6b7684]">{description}</p>

        <div className="site-label mt-8 flex items-center gap-4 text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-none tracking-[-0.08em] text-[#0f1b2b]">
          <span>{departureCode}</span>
          <RouteArrow />
          <span>{arrivalCode}</span>
        </div>
      </div>

      <div className="voyage-ticket-stub flex min-h-44 flex-col bg-[#0f1b2b] p-6 text-white md:min-h-full">
        <p className="site-label text-[0.6rem] font-medium uppercase tracking-[0.16em] text-white/55">
          {stubLabel}
        </p>
        <span
          className="voyage-barcode mt-5 h-9 w-full opacity-60"
          aria-hidden="true"
        />
        <p className="site-label mt-5 text-xs font-medium uppercase tracking-[0.12em] text-white/70">
          Boarding / 01
        </p>
        <a
          href={actionHref}
          className="site-label mt-auto pt-8 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:text-[#9bb5ff]"
        >
          {actionLabel} →
        </a>
      </div>
    </article>
  );
}
