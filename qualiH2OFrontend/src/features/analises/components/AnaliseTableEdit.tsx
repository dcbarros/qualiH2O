import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listAnalises } from "../api";
import { useEffect, useState } from "react";
import { ActionsCell } from "./ActionCell";
import { ArrowBigRight, ArrowBigLeft } from "lucide-react";

import type { AnaliseFilters } from "../api";

export function AnalisesTableEdit({ filters }: { filters: AnaliseFilters }) {
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => { setPage(0); }, [filters.codigo, filters.analista, filters.local, filters.status, filters.aceite]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analises", { page, size, filters }],
    queryFn: () => listAnalises(page, size, "horaDaAmostragem,DESC", filters),
    placeholderData: keepPreviousData
  });

  if (isLoading && !data) return <div className="rounded-2xl border bg-white p-4 h-64 animate-pulse" />;
  if (isError || !data) return <div className="text-sm text-red-600">Erro ao carregar análises.</div>;

  return (
    <div className="relative border border-sky-600 overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-700">
        <thead className="text-xs uppercase bg-sky-100">
          <tr>
            <th className="px-6 py-3 text-center font-semibold text-sky-900 border-e border-sky-600">Código</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Data</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Analista</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Local</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">pH</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Turbidez</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Condut.</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Status</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Aceite</th>
            <th className="px-6 py-3 text-center font-semibold text-sky-900">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.content.map((a) => (
            <tr key={a.id} className="bg-white border-b border-sky-600 hover:bg-sky-50">
              <td className="text-center px-6 py-3 text-sky-900 font-semibold bg-sky-100 border-e border-sky-600">{a.codigo}</td>
              <td className="text-center px-6 py-3 text-sky-900">{new Date(a.horaDaAmostragem).toLocaleString()}</td>
              <td className="text-center px-6 py-3 text-sky-900">{a.analista}</td>
              <td className="text-center px-6 py-3 text-sky-900">{a.local}</td>
              <td className="text-center px-6 py-3 text-sky-900">{a.ph.toFixed(2)}</td>
              <td className="text-center px-6 py-3 text-sky-900">{a.turbidez.toFixed(2)}</td>
              <td className="text-center px-6 py-3 text-sky-900">{a.condutancia.toFixed(2)}</td>
              <td className="text-center px-6 py-3 text-sky-900">
                <span className={a.statusDaAmostra ? "text-green-600" : "text-red-600"}>
                  {a.statusDaAmostra ? "Aprovada" : "Reprovada"}
                </span>
              </td>
              <td className="text-center px-6 py-3">{a.aceiteRelatorio ? "Sim" : "Não"}</td>
              <td className="text-center px-6 py-3">
                <ActionsCell a={a} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-3 text-sm">
        <div className="text-sky-600">Página {data.number + 1} de {data.totalPages}</div>
        <div className="space-x-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="rounded border border-sky-600 px-3 py-1 disabled:opacity-50"
          >

            <div className="flex items-center text-sky-600">
              <ArrowBigLeft className="h-3.5 w-3.5 me-2" />
              <p>Anterior</p>
            </div>
          </button>
          <button
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded border border-sky-600  px-3 py-1 disabled:opacity-50"
          >
            <div className="flex items-center text-sky-600">
              <ArrowBigRight className="h-3.5 w-3.5 me-2" />
              <p>Próximo</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
