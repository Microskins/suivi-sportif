import type { BodyMeasurement } from "../../api/client";
import { BodyMeasurementForm } from "./body-measurement-form";
import { BodyMeasurementsList } from "./body-measurements-list";
import { activeViewButtonClass, inactiveViewButtonClass } from "./shared";

export function DashboardMeasurementsSection({
  bodyMeasurementDraft,
  measurements,
  userDateOfBirth,
  formatDate,
  onShowHistory,
  onShowCreate,
  onEditMeasurement,
  onDeleteMeasurement,
  onCancelMeasurementForm,
  onSubmitMeasurement,
}: {
  bodyMeasurementDraft: BodyMeasurement | undefined;
  measurements: BodyMeasurement[];
  userDateOfBirth: string | null;
  formatDate: (value: string) => string;
  onShowHistory: () => void;
  onShowCreate: () => void;
  onEditMeasurement: (measurement: BodyMeasurement) => void;
  onDeleteMeasurement: (measurement: BodyMeasurement) => void;
  onCancelMeasurementForm: () => void;
  onSubmitMeasurement: Parameters<typeof BodyMeasurementForm>[0]["onSubmit"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          className={bodyMeasurementDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowHistory}
        >
          Historique
        </button>
        <button
          type="button"
          className={bodyMeasurementDraft !== undefined && !bodyMeasurementDraft.id ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowCreate}
        >
          Ajouter une mesure
        </button>
      </div>
      {bodyMeasurementDraft !== undefined ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <BodyMeasurementForm
            item={bodyMeasurementDraft.id ? bodyMeasurementDraft : undefined}
            onCancel={onCancelMeasurementForm}
            onSubmit={onSubmitMeasurement}
          />
        </div>
      ) : (
        <BodyMeasurementsList
          measurements={measurements}
          userDateOfBirth={userDateOfBirth}
          formatDate={formatDate}
          onEdit={onEditMeasurement}
          onDelete={onDeleteMeasurement}
        />
      )}
    </div>
  );
}
