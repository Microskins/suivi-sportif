import type { BodyMeasurement } from "../../api/client";
import { BodyInterpretation } from "./body-interpretation";
import { BodyMeasurementDiagram } from "./body-measurement-diagram";
import { BodyMeasurementTrends } from "./body-measurement-trends";
import { bodyMeasurementFields } from "./body-measurements";
import {
  computeAgeFromDateOfBirth,
  computeBmi,
  computeDailyEnergyExpenditure,
  computeMifflinBmr,
  computeUsNavyBodyFat,
  formatComputedValue,
  measurementValue,
} from "./body-metrics";
import { EmptyState, ItemActions, itemCardClass } from "./shared";

export function BodyMeasurementsList({
  measurements,
  userDateOfBirth,
  formatDate,
  onEdit,
  onDelete,
}: {
  measurements: BodyMeasurement[];
  userDateOfBirth: string | null;
  formatDate: (value: string) => string;
  onEdit: (item: BodyMeasurement) => void;
  onDelete: (item: BodyMeasurement) => void;
}) {
  if (!measurements.length) {
    return <EmptyState label="Aucune mensuration enregistree pour le moment." />;
  }

  const latest = measurements[0];
  const computedAge = computeAgeFromDateOfBirth(userDateOfBirth);
  const latestBmi = computeBmi(latest);
  const latestBodyFat = computeUsNavyBodyFat(latest);
  const latestBmr = computeMifflinBmr(latest, computedAge);
  const latestTdee = computeDailyEnergyExpenditure(latest, computedAge);

  return (
    <div className="space-y-4">
      <section className="rounded border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Derniere mesure
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(260px,430px)_1fr]">
          <BodyMeasurementDiagram measurement={latest} />
          <div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-sm text-emerald-900/70">Poids</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "weightKg", "kg")}
                </p>
              </div>
              <div>
                <p className="text-sm text-emerald-900/70">Taille</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "heightCm", "cm")}
                </p>
              </div>
              <div>
                <p className="text-sm text-emerald-900/70">Taille abdominale</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "waistCm", "cm")}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">IMC</p>
                <p className="text-xl font-bold text-emerald-950">
                  {formatComputedValue(latestBmi)}
                </p>
              </div>
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">Masse grasse (US Navy)</p>
                <p className="text-xl font-bold text-emerald-950">
                  {latestBodyFat === null ? "-" : `${formatComputedValue(latestBodyFat)} %`}
                </p>
              </div>
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">Metabolisme de base</p>
                <p className="text-xl font-bold text-emerald-950">
                  {latestBmr === null ? "-" : `${Math.round(latestBmr)} kcal`}
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Age: </span>
                {computedAge === null ? "-" : `${computedAge} ans`}
              </p>
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Activite: </span>
                {latest.isActiveLifestyle ? "Actif" : "Peu actif"}
              </p>
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Depense journaliere estimee: </span>
                {latestTdee === null ? "-" : `${Math.round(latestTdee)} kcal`}
              </p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-emerald-950/80 sm:grid-cols-2">
              {bodyMeasurementFields.slice(2, 9).map(([key, label, unit]) => (
                <p key={key} className="rounded bg-white/70 px-3 py-2">
                  <span className="font-medium">{label}: </span>
                  {measurementValue(latest, key, unit)}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs text-emerald-900/70">
              Le metabolisme de base est calcule avec Mifflin-St Jeor depuis la date de naissance, la taille et le poids.
            </p>
            <p className="mt-3 text-sm text-emerald-900/70">
              {formatDate(latest.date)}
            </p>
          </div>
        </div>
      </section>

      <BodyMeasurementTrends measurements={measurements} />
      <BodyInterpretation measurement={latest} ageYears={computedAge} />

      <ul className="space-y-3">
        {measurements.map((measurement) => (
          <li key={measurement.id} className={itemCardClass}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">
                  {formatDate(measurement.date)}
                </p>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                  {bodyMeasurementFields.slice(0, 9).map(([key, label, unit]) => (
                    <p key={key}>
                      <span className="font-medium text-slate-800">{label}: </span>
                      {measurementValue(measurement, key, unit)}
                    </p>
                  ))}
                </div>
                {measurement.notes && (
                  <p className="mt-2 text-sm text-slate-500">{measurement.notes}</p>
                )}
              </div>
              <ItemActions item={measurement} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
