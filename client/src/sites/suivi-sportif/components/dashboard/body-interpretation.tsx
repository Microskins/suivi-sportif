import type { BodyMeasurement } from "../../api/client";
import {
  calorieGuidance,
  classifyBmi,
  classifyBodyFat,
  computeBmi,
  computeDailyEnergyExpenditure,
  computeUsNavyBodyFat,
  formatComputedValue,
} from "./body-metrics";

export function BodyInterpretation({
  measurement,
  ageYears,
}: {
  measurement: BodyMeasurement;
  ageYears: number | null;
}) {
  const bmi = computeBmi(measurement);
  const bodyFat = computeUsNavyBodyFat(measurement);
  const tdee = computeDailyEnergyExpenditure(measurement, ageYears);
  const bmiInfo = classifyBmi(bmi);
  const bodyFatInfo = classifyBodyFat(bodyFat, measurement.silhouette);
  const calories = calorieGuidance(tdee);

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="font-semibold text-neutral-950">Lecture des indicateurs</h3>
        <p className="mt-1 text-sm text-neutral-500">Repere simple pour transformer les mesures en decisions.</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">IMC</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatComputedValue(bmi)}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{bmiInfo.label}</p>
          <p className="mt-1 text-xs text-slate-500">{bmiInfo.detail}</p>
        </div>
        <div className="rounded border border-rose-100 bg-rose-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Masse grasse</p>
          <p className="mt-2 text-2xl font-bold text-rose-950">
            {bodyFat === null ? "-" : `${formatComputedValue(bodyFat)} %`}
          </p>
          <p className="mt-1 text-sm font-medium text-rose-800">{bodyFatInfo.label}</p>
          <p className="mt-1 text-xs text-rose-700/80">{bodyFatInfo.detail}</p>
        </div>
        <div className="rounded border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Calories</p>
          <p className="mt-2 text-sm text-emerald-950">Maintien: <span className="font-bold">{calories.maintenance}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Deficit leger: <span className="font-bold">{calories.deficit}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Surplus leger: <span className="font-bold">{calories.surplus}</span></p>
          <p className="mt-2 text-xs text-emerald-700/80">{calories.detail}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Ces indicateurs sont des estimations de suivi personnel, pas un diagnostic medical.
      </p>
    </section>
  );
}
