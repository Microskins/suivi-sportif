import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMeasurement } from "../../api/client";
import { computeBmi, computeUsNavyBodyFat, roundOne } from "./body-metrics";

type BodyTrendPeriod = "30d" | "90d" | "365d";

const bodyTrendPeriods: Array<{ key: BodyTrendPeriod; label: string; days: number }> = [
  { key: "30d", label: "30j", days: 30 },
  { key: "90d", label: "90j", days: 90 },
  { key: "365d", label: "1 an", days: 365 },
];

function buildBodyTrendRows(measurements: BodyMeasurement[], days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return [...measurements]
    .filter((measurement) => new Date(measurement.date).getTime() >= since.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((measurement) => ({
      label: new Date(measurement.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      poids: measurement.weightKg === null ? null : roundOne(measurement.weightKg),
      imc: roundOne(computeBmi(measurement) ?? NaN),
      masseGrasse: roundOne(computeUsNavyBodyFat(measurement) ?? NaN),
      taille: measurement.waistCm === null ? null : roundOne(measurement.waistCm),
    }))
    .map((row) => ({
      ...row,
      imc: Number.isNaN(row.imc) ? null : row.imc,
      masseGrasse: Number.isNaN(row.masseGrasse) ? null : row.masseGrasse,
    }));
}

function deltaLabel(first: number | null, latest: number | null, unit: string) {
  if (first === null || latest === null) return "-";
  const delta = roundOne(latest - first);
  if (delta === 0) return `stable ${unit}`.trim();
  return `${delta > 0 ? "+" : ""}${delta} ${unit}`.trim();
}

export function BodyMeasurementTrends({ measurements }: { measurements: BodyMeasurement[] }) {
  const [period, setPeriod] = useState<BodyTrendPeriod>("90d");
  const selectedPeriod = bodyTrendPeriods.find((item) => item.key === period) ?? bodyTrendPeriods[1];
  const rows = buildBodyTrendRows(measurements, selectedPeriod.days);
  const first = rows[0];
  const latest = rows[rows.length - 1];
  const hasTrendData = rows.length >= 2;

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-neutral-950">Tendances corporelles</h3>
          <p className="mt-1 text-sm text-neutral-500">Poids, IMC, masse grasse et taille abdominale.</p>
        </div>
        <div className="flex flex-wrap gap-2 rounded border border-neutral-200 bg-neutral-50 p-1">
          {bodyTrendPeriods.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`rounded border px-3 py-2 text-sm font-medium transition ${
                period === item.key
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {hasTrendData ? (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="poids" name="Poids kg" stroke="#047857" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="imc" name="IMC" stroke="#111827" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="masseGrasse" name="Masse grasse %" stroke="#e11d48" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="taille" name="Taille cm" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Poids: {deltaLabel(first?.poids ?? null, latest?.poids ?? null, "kg")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">IMC: {deltaLabel(first?.imc ?? null, latest?.imc ?? null, "")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Masse grasse: {deltaLabel(first?.masseGrasse ?? null, latest?.masseGrasse ?? null, "%")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Taille: {deltaLabel(first?.taille ?? null, latest?.taille ?? null, "cm")}</p>
          </div>
        </>
      ) : (
        <div className="mt-4 flex h-56 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
          Deux mesures sur la periode sont necessaires pour afficher une tendance.
        </div>
      )}
    </section>
  );
}
