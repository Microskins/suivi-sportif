// Lien vers le logement ou l'on a dormi a une etape (Airbnb le plus souvent).

const AIRBNB_HOST = /(^|\.)airbnb\.[a-z.]{2,8}$/i;

// "Airbnb" pour une annonce Airbnb, sinon le domaine (ex. booking.com).
export function lodgingProvider(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return AIRBNB_HOST.test(host) ? "Airbnb" : host;
  } catch {
    return "le site";
  }
}

export function TripLodgingLink({
  className = "",
  stageTitle,
  url,
}: {
  className?: string;
  stageTitle: string;
  url: string;
}) {
  const provider = lodgingProvider(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={`Logement de l’étape ${stageTitle}, sur ${provider} (nouvel onglet)`}
      className={`site-label inline-flex items-center gap-1.5 rounded-full border border-[#dfe4ea] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#0f1b2b] hover:border-[#1c4ed8] hover:text-[#1c4ed8] ${className}`}
    >
      <span aria-hidden="true">⌂</span>
      Où on a dormi · {provider} ↗
    </a>
  );
}
