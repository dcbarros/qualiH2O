import { useQuery } from "@tanstack/react-query";
import { getStatus, getCards } from "../api";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

export function StatusPie() {

    const { data: status, isLoading: loadingStatus, isError: errorStatus } = useQuery({
        queryKey: ["dashboard", "status"],
        queryFn: getStatus,
        staleTime: 30_000,
    });

    const { data: cards, isLoading: loadingCards, isError: errorCards } = useQuery({
        queryKey: ["dashboard", "cards"],
        queryFn: getCards,
        staleTime: 30_000,
    });

    if (loadingStatus || loadingCards) {
        return (
            <div className="grid md:grid-cols-2 gap-4">
                {[0, 1].map(i => (
                    <div key={i} className="rounded-2xl border bg-white p-4">
                        <div className="h-56 animate-pulse rounded-xl bg-zinc-100" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">

            <div className="rounded-2xl border bg-white p-4">
                <div className="mb-0 font-semibold text-center text-lime-600">Aprovados x Reprovados</div>
                {errorStatus || !status ? (
                    <p className="text-center text-xs text-red-600 my-3">Falha ao carregar status.</p>
                ) : (
                    <>
                        <p className="text-center text-xs text-lime-500 mb-3">
                            Total de análises = <span className="font-medium">{status.aprovados + status.reprovados}</span>
                        </p>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Aprovados", value: status.aprovados },
                                            { name: "Reprovados", value: status.reprovados },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        label={(e: any) => {
                                            const total = status.aprovados + status.reprovados || 1;
                                            const pct = Math.round((e.value / total) * 100);
                                            return `${e.name} (${pct}%)`;
                                        }}
                                        labelLine={false}
                                    >
                                        <Cell fill="#35b363ff" /> 
                                        <Cell fill="#df5656ff" /> 
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>


            <div className="rounded-2xl border bg-white p-4">
                <div className="mb-0 font-semibold text-center text-lime-600">Pendentes x Aceitas</div>
                {errorCards || !cards ? (
                    <p className="text-center text-xs text-red-600 my-3">Falha ao carregar cards.</p>
                ) : (
                    (() => {
                        const pendentes = Number(cards.abertas) || 0;
                        const total = Number(cards.total) || 0;
                        const aceitas = Math.max(0, total - pendentes);
                        const rows = [
                            { name: "Pendentes", value: pendentes },
                            { name: "Aceitas", value: aceitas },
                        ];
                        const sum = pendentes + aceitas || 1;

                        return (
                            <>
                                <p className="text-center text-xs text-lime-500 mb-3">
                                    Total de análises = <span className="font-medium">{total}</span>
                                </p>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={rows}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={80}
                                                label={(e: any) => {
                                                    const pct = Math.round((e.value / sum) * 100);
                                                    return `${e.name} (${pct}%)`;
                                                }}
                                                labelLine={false}
                                            >
                                                <Cell fill="#edf035ff" /> 
                                                <Cell fill="#3b82f6" /> 
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
