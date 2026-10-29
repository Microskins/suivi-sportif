import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GpxTrack } from "./gpx-track";
import { elevationProfile, formatDuration, trackStats } from "./gpx-track";

type TripTrackCardProps = {
  track: GpxTrack;
};

// Resume d'une trace GPS facon Strava: distance, denivele, duree et profil
// altimetrique. Le graphique est decoratif; les chiffres portent l'info.
export function TripTrackCard({ track }: TripTrackCardProps) {
  // useId produit des ":" invalides dans une reference url(#...).
  const gradientId = `profil-${useId().replace(/:/g, "")}`;
  const stats = trackStats(track.points);
  const profile = elevationProfile(track.points);
  const figures = [
    [
      "Distance",
      `${stats.distanceKm.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`,
    ],
    ["Dénivelé +", stats.ascentM === null ? "—" : `${stats.ascentM} m`],
    [
      "Durée",
      stats.durationMs === null ? "—" : formatDuration(stats.durationMs),
    ],
  ];

  return (
    <article className="rounded-lg border border-[#dfe4ea] p-3">
      <p className="site-label text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[var(--site-muted)]">
        GPS · {track.kind === "trajet" ? "Trajet" : "Activité"}
      </p>
      <h4 className="site-display mt-1 text-base font-semibold leading-snug">
        {track.name}
      </h4>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {figures.map(([label, value]) => (
          <div key={label}>
            <dt className="site-label text-[0.55rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
              {label}
            </dt>
            <dd className="site-label mt-0.5 text-sm font-semibold text-[#0f1b2b]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {profile.length > 1 && (
        <div className="mt-3 h-20" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={profile}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e08a1e" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#1c4ed8" stopOpacity={0.12} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distanceKm"
                hide
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                dataKey="eleM"
                hide
                domain={["dataMin - 20", "dataMax + 20"]}
              />
              <Tooltip
                formatter={(value) => [`${value} m`, "Altitude"]}
                labelFormatter={(value) => `${value} km`}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  borderColor: "#dfe4ea",
                }}
              />
              <Area
                dataKey="eleM"
                type="monotone"
                stroke="#1c4ed8"
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
