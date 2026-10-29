import type { FormEvent } from "react";
import { useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage, fieldErrors } from "./admin-api";
import type { FlightDraft } from "./admin-form";
import { emptyFlight } from "./admin-form";
import {
  ErrorAlert,
  Panel,
  SelectField,
  TextField,
  buttonClass,
} from "./admin-ui";
import type { Airport, TravelMode } from "./trip-types";

type FlightsProps = {
  airports: Airport[];
  disabled: boolean;
  errors: Record<string, string>;
  flights: FlightDraft[];
  onAirportSaved: (airport: Airport) => void;
  onAuthError: AuthErrorHandler;
  onChange: (flights: FlightDraft[]) => void;
};

export function AdminFlights({
  airports,
  disabled,
  errors,
  flights,
  onAirportSaved,
  onAuthError,
  onChange,
}: FlightsProps) {
  const update = (index: number, patch: Partial<FlightDraft>) =>
    onChange(
      flights.map((flight, i) =>
        i === index ? { ...flight, ...patch } : flight,
      ),
    );

  const airportOptions = (
    <>
      <option value="">Choisir un lieu</option>
      {airports.map((airport) => (
        <option key={airport.code} value={airport.code}>
          {airport.code} — {airport.city} ({airport.name})
        </option>
      ))}
    </>
  );

  return (
    <Panel title="Trajets">
      <p className="text-sm leading-6 text-[var(--site-muted)]">
        Chaque trajet trace un arc sur le globe : trait plein en avion, tirets
        en voiture. Un retour depuis une autre ville est un second trajet.
      </p>
      {errors.flights && (
        <p className="mt-2 text-sm font-medium text-[#b42318]">
          {errors.flights}
        </p>
      )}
      <ol className="mt-4 grid gap-4">
        {flights.map((flight, index) => (
          <li
            key={flight.key}
            className="grid items-end gap-3 rounded-[10px] border border-[#dfe4ea] p-4 sm:grid-cols-[9rem_1fr_1fr_auto]"
          >
            <SelectField
              label={`Trajet ${index + 1} — transport`}
              value={flight.mode}
              disabled={disabled}
              onChange={(event) =>
                update(index, { mode: event.target.value as TravelMode })
              }
            >
              <option value="avion">Avion</option>
              <option value="voiture">Voiture</option>
            </SelectField>
            <SelectField
              label={`Trajet ${index + 1} — départ`}
              value={flight.fromCode}
              required
              disabled={disabled}
              error={errors[`flights.${index}.fromCode`]}
              onChange={(event) =>
                update(index, { fromCode: event.target.value })
              }
            >
              {airportOptions}
            </SelectField>
            <SelectField
              label={`Trajet ${index + 1} — arrivée`}
              value={flight.toCode}
              required
              disabled={disabled}
              error={errors[`flights.${index}.toCode`]}
              onChange={(event) =>
                update(index, { toCode: event.target.value })
              }
            >
              {airportOptions}
            </SelectField>
            <button
              type="button"
              className={buttonClass.secondary}
              disabled={disabled || flights.length === 1}
              aria-label={`Retirer le trajet ${index + 1}`}
              onClick={() => onChange(flights.filter((_, i) => i !== index))}
            >
              Retirer
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${buttonClass.secondary} mt-4`}
        disabled={disabled}
        onClick={() => onChange([...flights, emptyFlight()])}
      >
        Ajouter un trajet
      </button>
      <AirportForm onSaved={onAirportSaved} onAuthError={onAuthError} />
    </Panel>
  );
}

const emptyAirport = {
  code: "",
  city: "",
  name: "",
  latitude: "",
  longitude: "",
};

function AirportForm({
  onAuthError,
  onSaved,
}: {
  onAuthError: AuthErrorHandler;
  onSaved: (airport: Airport) => void;
}) {
  const [values, setValues] = useState(emptyAirport);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const field = (name: keyof typeof emptyAirport) => ({
    value: values[name],
    error: errors[name],
    disabled: pending,
    onChange: (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [name]: event.target.value })),
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const number = (value: string) => Number(value.trim().replace(",", "."));
    const latitude = number(values.latitude);
    const longitude = number(values.longitude);
    const local: Record<string, string> = {};
    if (values.latitude.trim() === "" || !Number.isFinite(latitude)) {
      local.latitude = "Latitude attendue (ex. 55.95).";
    }
    if (values.longitude.trim() === "" || !Number.isFinite(longitude)) {
      local.longitude = "Longitude attendue (ex. -3.3725).";
    }
    setErrors(local);
    setSaved(null);
    if (Object.keys(local).length) {
      setError("Le lieu n’a pas été enregistré : vérifiez les coordonnées.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const airport = await adminApi.saveAirport({
        code: values.code.trim(),
        city: values.city.trim(),
        name: values.name.trim(),
        latitude,
        longitude,
      });
      onSaved(airport);
      setValues(emptyAirport);
      setSaved(
        `Lieu ${airport.code} enregistré : il est disponible dans les trajets.`,
      );
    } catch (failure) {
      if (!onAuthError(failure)) {
        setErrors(fieldErrors(failure));
        setError(adminErrorMessage(failure));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="mt-6 rounded-[10px] border border-[#dfe4ea] bg-[#f8fafb]">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Lieu absent de la liste (aéroport ou ville) ? L’ajouter ou le corriger
      </summary>
      <form className="grid gap-3 px-4 pb-4 sm:grid-cols-2" onSubmit={submit}>
        <TextField
          label="Code du lieu"
          hint="3 lettres : code IATA d’un aéroport (ex. EDI) ou d’une ville (ex. LIL). Un code existant est mis à jour."
          required
          maxLength={3}
          autoComplete="off"
          {...field("code")}
        />
        <TextField label="Ville" required {...field("city")} />
        <TextField
          className="sm:col-span-2"
          label="Nom du lieu"
          required
          {...field("name")}
        />
        <TextField
          label="Latitude"
          inputMode="decimal"
          required
          {...field("latitude")}
        />
        <TextField
          label="Longitude"
          inputMode="decimal"
          required
          {...field("longitude")}
        />
        <div className="grid gap-3 sm:col-span-2">
          <ErrorAlert>{error}</ErrorAlert>
          {saved && (
            <p role="status" className="text-sm font-medium text-[#1c4ed8]">
              {saved}
            </p>
          )}
          <button
            type="submit"
            className={`${buttonClass.secondary} justify-self-start`}
            disabled={pending}
          >
            {pending ? "Enregistrement…" : "Enregistrer le lieu"}
          </button>
        </div>
      </form>
    </details>
  );
}
