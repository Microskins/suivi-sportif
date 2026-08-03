import { inputClass } from "./shared";

export function WorkoutTemplateFilters({
  templateSearch,
  templateCategoryFilter,
  templateLevelFilter,
  templateCategories,
  templateLevels,
  onTemplateSearchChange,
  onTemplateCategoryFilterChange,
  onTemplateLevelFilterChange,
}: {
  templateSearch: string;
  templateCategoryFilter: string;
  templateLevelFilter: string;
  templateCategories: string[];
  templateLevels: string[];
  onTemplateSearchChange: (value: string) => void;
  onTemplateCategoryFilterChange: (value: string) => void;
  onTemplateLevelFilterChange: (value: string) => void;
}) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-800">Filtres modèles</p>
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className={inputClass}
          value={templateSearch}
          onChange={(event) => onTemplateSearchChange(event.target.value)}
          placeholder="Rechercher..."
        />
        <select
          className={inputClass}
          value={templateCategoryFilter}
          onChange={(event) => onTemplateCategoryFilterChange(event.target.value)}
        >
          <option value="ALL">Toutes categories</option>
          {templateCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          className={inputClass}
          value={templateLevelFilter}
          onChange={(event) => onTemplateLevelFilterChange(event.target.value)}
        >
          <option value="ALL">Tous niveaux</option>
          {templateLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
