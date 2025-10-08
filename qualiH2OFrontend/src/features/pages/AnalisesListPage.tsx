import { useState } from "react";
import { AnalisesTableEdit } from "../analises/components/AnaliseTableEdit";
import { AnalisesFilters } from "../analises/components/AnalisesFilters";
import type { AnaliseFilters } from "../analises/api";
import type { FiltersState } from "../analises/components/AnalisesFilters";

export function AnalisesListPage() {
  const [filtersState, setFiltersState] = useState<FiltersState>({
    codigo: "",
    analista: "",
    local: "",
    status: "TODOS",
    aceite: "TODOS",
  });

  const apiFilters: AnaliseFilters = {
    codigo: filtersState.codigo || undefined,
    analista: filtersState.analista || undefined,
    local: filtersState.local || undefined,
    status: filtersState.status,
    aceite: filtersState.aceite,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-sky-900">Análises</h2>

      <AnalisesFilters
        value={filtersState}
        onChange={setFiltersState}
      />

      <AnalisesTableEdit filters={apiFilters} />
    </div>
  );
}
