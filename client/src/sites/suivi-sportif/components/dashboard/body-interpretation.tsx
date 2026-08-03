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
    <section className="panel p-5">
      <div>
        <h3 className="site-display font-bold text-[#2b241e]">Lecture des indicateurs</h3>
        <p className="mt-1 text-sm text-[#9c8f83]">Repère simple pour transformer les mesures en décisions.</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] bg-[#fdf6ef] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">IMC</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatComputedValue(bmi)}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{bmiInfo.label}</p>
          <p className="mt-1 text-xs text-slate-500">{bmiInfo.detail}</p>
        </div>
        <div className="rounded-[16px] bg-[#fff1ed] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Masse grasse</p>
          <p className="mt-2 text-2xl font-bold text-rose-950">
            {bodyFat === null ? "-" : `${formatComputedValue(bodyFat)} %`}
          </p>
          <p className="mt-1 text-sm font-medium text-rose-800">{bodyFatInfo.label}</p>
          <p className="mt-1 text-xs text-rose-700/80">{bodyFatInfo.detail}</p>
        </div>
        <div className="rounded-[16px] bg-[#eaf6f1] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Calories</p>
          <p className="mt-2 text-sm text-emerald-950">Maintien : <span className="font-bold">{calories.maintenance}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Déficit léger : <span className="font-bold">{calories.deficit}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Surplus léger : <span className="font-bold">{calories.surplus}</span></p>
          <p className="mt-2 text-xs text-emerald-700/80">{calories.detail}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Ces indicateurs sont des estimations de suivi personnel, pas un diagnostic médical.
      </p>
    </section>
  );
}
