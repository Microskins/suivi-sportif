// Recherche de la position d'une etape a partir de l'adresse du logement
// (celle que donne le loueur). L'adresse sert uniquement a la recherche:
// elle n'est pas enregistree, seules la longitude et la latitude le sont.
import { useId, useState } from "react";
import type { GeocodeResult } from "./admin-api";
import { adminApi } from "./admin-api";
import { buttonClass, inputClass, labelClass } from "./admin-ui";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; results: GeocodeResult[] }
  | { kind: "error"; message: string };

export function AdminAddressSearch({
  className = "",
  disabled,
  onPick,
}: {
  className?: string;
  disabled: boolean;
  onPick: (coordinates: GeocodeResult["coordinates"]) => void;
}) {
  const id = useId();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [picked, setPicked] = useState("");

  async function search() {
    const query = address.trim();
    if (query.length < 3) {
      setStatus({ kind: "error", message: "Saisissez l’adresse complète." });
      return;
    }
    setStatus({ kind: "loading" });
    setPicked("");
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
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Recherche d’adresse indisponible.",
      });
    }
  }

  function pick(result: GeocodeResult) {
    onPick(result.coordinates);
    setPicked(result.label);
    setStatus({ kind: "idle" });
  }

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
          aria-describedby={`${id}-aide`}
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
        L’adresse donnée par le loueur remplit la longitude et la latitude. Elle
        n’est pas enregistrée ni publiée.
      </p>
      <div role="status" className="mt-2 text-sm">
        {status.kind === "error" && (
          <p className="text-[#b42318]">{status.message}</p>
        )}
        {picked && (
          <p className="text-[var(--site-muted)]">
            Position reprise de : {picked}
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
