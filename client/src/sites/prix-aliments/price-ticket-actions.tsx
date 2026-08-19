import { useState } from "react";

type PriceTicketActionsProps = {
  isPrintReady: boolean;
  ticketNumber: string;
  ticketUrl: string;
};

type ShareStatus = "idle" | "copied" | "shared" | "error";

async function copyTicketUrl(ticketUrl: string) {
  await navigator.clipboard.writeText(ticketUrl);
}

export function PriceTicketActions({
  isPrintReady,
  ticketNumber,
  ticketUrl,
}: PriceTicketActionsProps) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const canShareNatively = typeof navigator.share === "function";

  async function shareTicket() {
    if (canShareNatively) {
      try {
        await navigator.share({
          text: `Comparatif alimentaire ${ticketNumber}`,
          title: `Prix Frais — Ticket N° ${ticketNumber}`,
          url: ticketUrl,
        });
        setShareStatus("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await copyTicketUrl(ticketUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    }
  }

  return (
    <section
      aria-labelledby="ticket-actions-title"
      className="price-divider print-hidden px-5 py-5 sm:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label text-left" id="ticket-actions-title">
            Ticket N° {ticketNumber}
          </p>
          <p className="mt-1 text-[0.62rem] leading-5 text-[var(--site-muted)]">
            Gardez exactement cette recherche ou emportez-la en magasin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="border-2 border-[#1c1c1c] px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.08em] hover:border-[#c1362b] hover:text-[#c1362b]"
            onClick={shareTicket}
            type="button"
          >
            {canShareNatively ? "Partager" : "Copier le lien"}
          </button>
          <button
            className="border-2 border-[#1c1c1c] bg-[#1c1c1c] px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#f7f5ef] hover:bg-[#c1362b] disabled:cursor-wait disabled:opacity-50"
            disabled={!isPrintReady}
            onClick={() => window.print()}
            type="button"
          >
            {isPrintReady ? "Imprimer" : "Préparation…"}
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-2 text-[0.6rem] text-[var(--site-muted)]">
        {shareStatus === "shared" ? "Ticket envoyé avec succès." : null}
        {shareStatus === "copied" ? "Lien copié dans le presse-papiers." : null}
        {shareStatus === "error"
          ? "Partage impossible. Vous pouvez copier l’adresse du navigateur."
          : null}
      </p>
    </section>
  );
}
