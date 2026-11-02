// Position d'une etape a partir de l'adresse du logement (celle que donne le
// loueur). L'adresse sert uniquement a la recherche: elle n'est pas
// enregistree, seule la position l'est. En secours, des coordonnees copiees
// depuis Google Maps ("55.95325, -3.18827") sont reprises telles quelles.
import { useId, useState } from "react";
import type { GeocodeResult } from "./admin-api";
import { adminApi } from "./admin-api";
import { buttonClass, inputClass, labelClass } from "./admin-ui";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; results: GeocodeResult[] }
  | { kind: "error"; message: string };

const COORDINATES = /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/;

// "latitude, longitude", l'ordre de Google Maps.
export function parseCoordinates(
  value: string,
): GeocodeResult["coordinates"] | null {
  const match = value.trim().match(COORDINATES);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lng, lat] : null;
}

export function AdminAddressSearch({
  className = "",
  disabled,
  error,
  onPick,
  positioned,
}: {
  className?: string;
  disabled: boolean;
  error?: string;
  onPick: (coordinates: GeocodeResult["coordinates"]) => void;
  positioned: boolean;
}) {
  const id = useId();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [picked, setPicked] = useState("");

  function pick(result: GeocodeResult) {
    onPick(result.coordinates);
    setPicked(result.label);
    setStatus({ kind: "idle" });
  }

  async function search() {
    const query = address.trim();
    const coordinates = parseCoordinates(query);
    if (coordinates) {
      pick({ coordinates, label: query });
      return;
    }
    if (query.length < 3) {
      setStatus({ kind: "error", message: "Saisissez l’adresse complète." });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const results = await adminApi.geocode(query);
      setStatus(
        results.length
          ? { kind: "results", results }
          : {
              kind: "error",
              message:
                "Adresse introuvable. Essayez sans le numéro d’appartement, ou avec la ville et le pays.",
            },
      );
    } catch (failure) {
      setStatus({
        kind: "error",
        message:
          failure instanceof Error
            ? failure.message
            : "Recherche d’adresse indisponible.",
      });
    }
  }

  const message = status.kind === "error" ? status.message : error;

  return (
    <div className={className}>
      <label htmlFor={`${id}-adresse`} className={labelClass}>
        Adresse du logement
      </label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <input
          id={`${id}-adresse`}
          className={`${inputClass} !mt-0 min-w-0 flex-1`}
          value={address}
          disabled={disabled}
          maxLength={300}
          autoComplete="off"
          aria-invalid={Boolean(message)}
          aria-describedby={`${id}-aide ${id}-etat`}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void search();
            }
          }}
        />
        <button
          type="button"
          className={buttonClass.secondary}
          disabled={disabled || status.kind === "loading"}
          onClick={() => void search()}
        >
          {status.kind === "loading" ? "Recherche…" : "Trouver la position"}
        </button>
      </div>
      <p id={`${id}-aide`} className="mt-1 text-xs text-[var(--site-muted)]">
        L’adresse donnée par le loueur place l’étape sur la carte ; elle n’est
        ni enregistrée ni publiée. Introuvable ? Collez la position copiée
        depuis Google Maps (ex. 55.95325, -3.18827).
      </p>
      <div id={`${id}-etat`} role="status" className="mt-2 text-sm">
        {message ? (
          <p className="text-[#b42318]">{message}</p>
        ) : picked ? (
          <p className="text-[#0f1b2b]">✓ Position reprise de : {picked}</p>
        ) : positioned ? (
          <p className="text-[#0f1b2b]">
            ✓ Position enregistrée. Cherchez une adresse pour la changer.
          </p>
        ) : (
          <p className="text-[var(--site-muted)]">
            Pas encore de position : cherchez l’adresse du logement.
          </p>
        )}
      </div>
      {status.kind === "results" && (
        <ul className="mt-2 grid gap-2" aria-label="Adresses trouvées">
          {status.results.map((result) => (
            <li
              key={`${result.coordinates.join(",")}-${result.label}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[#dfe4ea] px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1">{result.label}</span>
              <button
                type="button"
                className={buttonClass.small}
                aria-label={`Utiliser ${result.label}`}
                onClick={() => pick(result)}
              >
                Utiliser
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
