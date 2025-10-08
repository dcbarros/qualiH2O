import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAnalises } from "../../analises/api";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

function formatISOToBR(iso: string) {
    const normalized = iso.replace(/(\.\d{3})\d+/, '$1');
    const d = new Date(normalized);
    if (!d) throw new Error('Data inválida');

    const pad = (n: number) => String(n).padStart(2, '0');
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const HH = pad(d.getHours());
    const min = pad(d.getMinutes());

    return `${dd}/${mm}/${yyyy} - ${HH}:${min}`;
}

export function AnalisesTable() {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["analises", { page, size }],
        queryFn: () => listAnalises(page, size),
        placeholderData: keepPreviousData
    });

    if (isLoading && !data) {
        return <div className="rounded-2xl border bg-white p-4 h-64 animate-pulse" />;
    }
    if (isError || !data) {
        return <div className="text-sm text-red-600">Erro ao carregar análises.</div>;
    }

    return (
        <div className="relative border border-emerald-500 overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-600">
                <caption className="p-5 text-lg font-semibold text-lime-700 bg-white">
                    <h3 className="text-center">Histórico de análises</h3>
                    <p className="mt-1 text-sm font-normal text-lime-500 text-center">
                        Histórico de análises realizadas.
                    </p>
                </caption>

                <thead className="text-xs text-gray-700 uppercase bg-green-50">
                    <tr>
                        <th className="text-center px-3 py-2 text-lime-900">Código</th>
                        <th className="text-center px-3 py-2 text-lime-900">Analista</th>
                        <th className="text-center px-3 py-2 text-lime-900">Local</th>
                        <th className="text-center px-3 py-2 text-lime-900">pH</th>
                        <th className="text-center px-3 py-2 text-lime-900">Turbidez (NTU)</th>
                        <th className="text-center px-3 py-2 text-lime-900">Condut. (µS/cm)</th>
                        <th className="text-center px-3 py-2 text-lime-900">Status da amostra</th>
                        <th className="text-center px-3 py-2 text-lime-900">Data de coleta</th>
                        <th className="text-center px-3 py-2 text-lime-900">Aprovação</th>
                    </tr>
                </thead>

                <tbody>
                    {data.content.map((a) => (
                        <tr key={a.codigo} className="bg-white border-b border-lime-200">
                            <td className="text-center px-6 py-3 font-medium text-lime-900 bg-lime-50">{a.codigo}</td>
                            <td className="text-center px-6 py-3 text-lime-900">{a.analista}</td>
                            <td className="text-center px-6 py-3 text-lime-900">{a.local}</td>
                            <td className="text-center px-6 py-3 text-lime-900">
                                <span className={(a.ph >= 6.0 && a.ph <= 9.0) ? "" : "text-red-600"}>
                                    {a.ph.toFixed?.(2) ?? a.ph}
                                </span>
                            </td>
                            <td className="text-center px-6 py-3 text-lime-900">
                                <span className={(a.turbidez < 5.0) ? "" : "text-red-600"}>
                                    {a.turbidez.toFixed?.(2) ?? a.turbidez}
                                </span>
                            </td>
                            <td className="text-center px-6 py-3 text-lime-900">
                                <span className={(a.condutancia < 500.0) ? "" : "text-red-600"}>
                                    {a.condutancia.toFixed?.(0) ?? a.condutancia}
                                </span>
                            </td>
                            <td className="text-center px-6 py-3">
                                <span className={a.statusDaAmostra ? "text-green-600" : "text-red-600"}>
                                    {a.statusDaAmostra ? "Aprovada" : "Reprovada"}
                                </span>
                            </td>
                            <td className="text-center px-6 py-3 text-lime-900">
                                {formatISOToBR(a.horaDaAmostragem)}
                            </td>
                            <td className="text-center px-6 py-3">
                                <span className={a.aceiteRelatorio ? "text-green-600" : "text-amber-600"}>
                                    {a.aceiteRelatorio ? "Aprovado" : "Em análise|Reprovada"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            <div className="flex items-center justify-between p-3 text-sm bg-white border-t border-emerald-700">
                <div className="text-emerald-600">Página {data.number + 1} de {data.totalPages}</div>
                <div className="space-x-2">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="rounded border border-emerald-600 px-3 py-1 disabled:opacity-50"
                    >
                        <div className="flex items-center text-emerald-600">
                            <ArrowBigLeft className="h-3.5 w-3.5 me-2" />
                            <p>Anterior</p>
                        </div>
                    </button>
                    <button
                        disabled={page + 1 >= data.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded border border-emerald-600 px-3 py-1 disabled:opacity-50"
                    >
                        <div className="flex items-center text-emerald-600">
                            <ArrowBigRight className="h-3.5 w-3.5 me-2" />
                            <p>Próximo</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
