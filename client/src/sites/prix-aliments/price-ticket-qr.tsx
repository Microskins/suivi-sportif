import { useEffect, useState } from "react";

type PriceTicketQrProps = {
  qrCodeUrl?: string;
  ticketNumber: string;
};

type PriceTicketQrState = {
  sourceUrl: string;
  status: "loading" | "ready" | "unavailable";
  url?: string;
};

export function usePriceTicketQr(ticketUrl: string) {
  const [qrCode, setQrCode] = useState<PriceTicketQrState>({
    sourceUrl: ticketUrl,
    status: "loading",
  });

  useEffect(() => {
    let isCurrent = true;
    setQrCode({ sourceUrl: ticketUrl, status: "loading" });

    void import("qrcode")
      .then(({ toString }) =>
        toString(ticketUrl, {
          color: { dark: "#1c1c1c", light: "#ffffff" },
          errorCorrectionLevel: "M",
          margin: 4,
          type: "svg",
          width: 160,
        }),
      )
      .then((svg) => {
        if (isCurrent) {
          setQrCode({
            sourceUrl: ticketUrl,
            status: "ready",
            url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
          });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setQrCode({ sourceUrl: ticketUrl, status: "unavailable" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [ticketUrl]);

  return qrCode;
}

export function PriceTicketQr({ qrCodeUrl, ticketNumber }: PriceTicketQrProps) {
  if (!qrCodeUrl) {
    return null;
  }

  return (
    <figure className="print-only mx-auto mt-6 w-40 text-center">
      <img
        alt={`QR code du ticket ${ticketNumber}`}
        className="h-40 w-40"
        height="160"
        src={qrCodeUrl}
        width="160"
      />
      <figcaption className="mt-2 text-[0.54rem] leading-4 text-[#6b6b6b]">
        Scannez pour rouvrir le ticket {ticketNumber}
      </figcaption>
    </figure>
  );
}
