import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../api";
import { CartesianGrid, Label, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function parseYYYYMMDD(s: string) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function fmtDDMM_ymd(s: string) {
    const [datePart] = s.split('T');      
    const [_, m, d] = datePart.split('-');  
    return `${d}/${m}`;    
}

function fmtBR(d: Date) {
    return d.toLocaleDateString("pt-BR");
}

function media(values: Array<number | null | undefined>) {
    const nums = values.filter((v): v is number => typeof v === "number");
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function movingRanges(values: number[]) {
    const mrs: number[] = [];
    for (let i = 1; i < values.length; i++) {
        mrs.push(Math.abs(values[i] - values[i - 1]));
    }
    return mrs;
}

function calcIMRLimits(values: number[], metric: string) {

    if (values.length < 2) return null;
    const xbar = media(values)!;
    const mrs = movingRanges(values);
    const mrbar = media(mrs);
    if (mrbar == null) return null;

    const k = 2.66; // 3 * (1/d2) com d2=1.128
    let ucl;
    let lcl;

    if (metric === "PH") {
        ucl = xbar + k * mrbar > 9.0 ? 9.0 : xbar + k * mrbar;
        lcl = xbar - k * mrbar < 6.0 ? 6.0 : xbar - k * mrbar;
    } else if (metric === "CONDUTANCIA") {
        ucl = xbar + k * mrbar > 500.0 ? 500.0 : xbar + k * mrbar;
        lcl = xbar - k * mrbar < 0 ? 0 : xbar - k * mrbar;
    } else {
        ucl = xbar + k * mrbar > 5.0 ? 5.0 : xbar + k * mrbar;
        lcl = xbar - k * mrbar < 0 ? 0 : xbar - k * mrbar;
    }

    return { xbar, mrbar, ucl, lcl };
}

export function SeriesMetricas({ metric, title }: { metric: "PH" | "CONDUTANCIA" | "TURBIDEZ"; title: string }) {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["dashboard", "series", metric, 30],
        queryFn: () => getSeries(metric, 30),
        staleTime: 30_000,
    });

    if (isLoading) return <div className="h-64 rounded-2xl border bg-white p-4 animate-pulse" />;
    if (isError || !data) return <div className="text-sm text-red-600">Erro ao carregar série.</div>;

    const rows = data.map(d => ({ ...d, valor: d.valor === null ? null : d.valor }));
    const hasRows = rows && rows.length > 0;

    const sorted = [...rows].sort((a, b) => a.dia.localeCompare(b.dia));
    const primeiroDia = hasRows ? fmtBR(parseYYYYMMDD(sorted[0].dia)) : "-";
    const ultimoDia = hasRows ? fmtBR(parseYYYYMMDD(sorted[sorted.length - 1].dia)) : "-";

    const nomeSerieLabel =
        metric === "PH" ? "pH (média diária)" :
            metric === "CONDUTANCIA" ? "Condutância (µS/cm)" :
                "Turbidez (NTU)";
    const serieNumerica = sorted.map(d => d.valor).filter((v: any): v is number => typeof v === "number" && !Number.isNaN(v));
    const stats = calcIMRLimits(serieNumerica, metric);

    return (
        <div className="rounded-2xl border bg-white p-4 border-emerald-500">
            <div className="mb-3 font-semibold">
                <h3 className="font-semibold text-center text-lime-700">{title}</h3>
                <p className="text-center text-xs text-lime-500 mb-3">Dias {primeiroDia} a {ultimoDia}</p>
            </div>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sorted}
                        margin={{ top: 8, right: 40, bottom: 8, left: 12 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="dia" tickFormatter={fmtDDMM_ymd} tickMargin={8} />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(v: string) => fmtBR(parseYYYYMMDD(v))}
                            formatter={(value: any) => (value == null || Number.isNaN(Number(value)) ? "—" : value)}
                        />

                        {stats && (
                            <>
                                <ReferenceArea y1={stats.lcl} y2={stats.ucl} fill="#86efac" fillOpacity={0.25} />

                                <ReferenceLine y={stats.ucl} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={2} ifOverflow="extendDomain">
                                    <Label value="UCL" position="right" fill="#dc2626" fontSize={12} dx={4} dy={-2} />
                                </ReferenceLine>

                                <ReferenceLine y={stats.xbar} stroke="#2563eb" strokeDasharray="6 3" strokeWidth={2} ifOverflow="extendDomain">
                                    <Label value="CL" position="right" fill="#2563eb" fontSize={12} dx={4} />
                                </ReferenceLine>

                                <ReferenceLine y={stats.lcl} stroke="#16a34a" strokeDasharray="6 3" strokeWidth={2} ifOverflow="extendDomain">
                                    <Label value="LCL" position="right" fill="#16a34a" fontSize={12} dx={4} dy={2} />
                                </ReferenceLine>
                            </>
                        )}

                        <Line
                            type="monotone"
                            dataKey="valor"
                            name={nomeSerieLabel}
                            strokeWidth={2}
                            connectNulls
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {stats && (
                <div className="mt-2 text-xs text-zinc-600 text-center">
                    <span className="mr-4">CL: {stats.xbar.toFixed(2)}</span>
                    <span className="mr-4">UCL: {stats.ucl.toFixed(2)}</span>
                    <span className="mr-4">LCL: {stats.lcl.toFixed(2)}</span>
                    <span className="mr-4">MR̄: {calcIMRLimits(serieNumerica, metric)?.mrbar.toFixed(2)}</span>
                </div>
            )}
        </div>
    )
}