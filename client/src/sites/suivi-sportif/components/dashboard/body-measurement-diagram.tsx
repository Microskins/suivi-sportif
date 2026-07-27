import type { BodyMeasurement } from "../../api/client";
import type { BodyMeasurementField } from "./body-measurements";
import { measurementValue } from "./body-metrics";

export function BodyMeasurementDiagram({ measurement }: { measurement: BodyMeasurement }) {
  const silhouetteSrc =
    measurement.silhouette === "FEMALE"
      ? "/sites/suivi-sportif/body-measurements/body-silhouette-female.png"
      : "/sites/suivi-sportif/body-measurements/body-silhouette.png";
  const callouts: Array<{
    key: BodyMeasurementField;
    label: string;
    unit: string;
    lineClassName: string;
    labelClassName: string;
  }> = [
    {
      key: "neckCm",
      label: "Cou",
      unit: "cm",
      lineClassName: "left-[24%] top-[19%] w-[26%]",
      labelClassName: "left-[3%] top-[14%] text-left",
    },
    {
      key: "shouldersCm",
      label: "Epaules",
      unit: "cm",
      lineClassName: "left-[61%] top-[22%] w-[17%]",
      labelClassName: "right-[3%] top-[18%] text-left",
    },
    {
      key: "chestCm",
      label: "Poitrine",
      unit: "cm",
      lineClassName: "left-[20%] top-[31%] w-[26%]",
      labelClassName: "left-[3%] top-[27%] text-left",
    },
    {
      key: "rightArmCm",
      label: "Biceps",
      unit: "cm",
      lineClassName: "left-[64%] top-[34%] w-[15%]",
      labelClassName: "right-[3%] top-[31%] text-left",
    },
    {
      key: "rightForearmCm",
      label: "Avant-bras",
      unit: "cm",
      lineClassName: "left-[21%] top-[44%] w-[13%]",
      labelClassName: "left-[3%] top-[40%] text-left",
    },
    {
      key: "waistCm",
      label: "Taille",
      unit: "cm",
      lineClassName: "left-[53%] top-[44%] w-[25%]",
      labelClassName: "right-[3%] top-[40%] text-left",
    },
    {
      key: "hipsCm",
      label: "Hanches",
      unit: "cm",
      lineClassName: "left-[53%] top-[57%] w-[25%]",
      labelClassName: "right-[3%] top-[53%] text-left",
    },
    {
      key: "rightThighCm",
      label: "Cuisses",
      unit: "cm",
      lineClassName: "left-[23%] top-[60%] w-[21%]",
      labelClassName: "left-[3%] top-[56%] text-left",
    },
    {
      key: "rightCalfCm",
      label: "Mollets",
      unit: "cm",
      lineClassName: "left-[25%] top-[78%] w-[20%]",
      labelClassName: "left-[3%] top-[74%] text-left",
    },
  ];

  return (
    <div
      role="img"
      aria-label="Schema des mensurations corporelles"
      className="relative mx-auto aspect-[447/627] w-full max-w-[430px] overflow-hidden rounded border border-emerald-200 bg-emerald-50 shadow-sm"
    >
      <img
        src={silhouetteSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-emerald-900/5" />
      <div className="absolute inset-0 text-[10px] sm:text-xs">
        {callouts.map((callout) => (
          <div key={callout.key}>
            <span
              className={`absolute h-px rounded-full bg-emerald-800/80 shadow-[0_0_0_1px_rgba(255,255,255,0.45)] ${callout.lineClassName}`}
            />
            <span
              className={`absolute min-w-16 rounded bg-white/75 px-1.5 py-1 font-semibold leading-tight text-emerald-950 shadow-sm ring-1 ring-emerald-900/10 backdrop-blur ${callout.labelClassName}`}
            >
              {callout.label}
              <span className="block font-medium text-emerald-900/70">
                {measurementValue(measurement, callout.key, callout.unit)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
