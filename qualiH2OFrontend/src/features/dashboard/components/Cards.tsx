import { useQuery } from "@tanstack/react-query";
import { getCards } from "../api";

function num(n: number | string, digits = 2) {
    const v = typeof n === "string" ? Number(n) : n;
    if (Number.isNaN(v)) return "-";
    return v.toFixed(digits);
}

function CardStatus({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-md border-emerald-500">
            <div className="text-sm text-lime-600">{title}</div>
            <div className="mt-1 text-2xl text-green-600 font-semibold">{value}</div>
        </div>
    )
}

type CardVariaveisProps = {
    title: string;
    valueNum: number | string;
    display?: string | number;
    type: "ph" | "condutancia" | "turbidez" | string;
};

function CardVariaveis({ title, valueNum, display, type }: CardVariaveisProps) {

    const numVal = typeof valueNum === "string" ? Number(valueNum) : valueNum;
    let valueColor = "text-zinc-900";

    if (Number.isNaN(numVal)) {
        valueColor = "text-zinc-400";
    } else {
        if (type === "ph") {
            valueColor = numVal < 6 || numVal > 9 ? "text-red-600" : "text-green-600";
        } else if (type === "condutancia") {
            valueColor = numVal > 500 ? "text-red-600" : "text-green-600";
        } else if (type === "turbidez") {
            valueColor = numVal > 5 ? "text-red-600" : "text-green-600";
        }
    }

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-md border-emerald-500">
            <div className="text-sm text-lime-600">{title}</div>
            <div className={`mt-1 text-2xl font-semibold ${valueColor}`}>
                {display ?? (Number.isNaN(numVal) ? "-" : numVal)}
            </div>
        </div>
    );
}

export function Cards() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["dashboard", "cards"],
        queryFn: getCards,
        staleTime: 30_000,
    });

    if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 })
            .map((_, i) => (
                <div key={i} className="rounded-2-l border bg-white p-4 animate-pulse h-20" />
            )
            )};
    </div>

    if (isError || !data) return <div className="text-sm text-red-600">Falha ao carregar cards</div>

    return (
        <div className="grip gap-4 sm:grip-cols-2 lg:grip-cols-5">
            <div className="grid md:grid-cols-2 gap-4 mb-2">
                <CardStatus title="Em Aberto" value={data.abertas} />
                <CardStatus title="Total Aprovadas" value={data.total - data.abertas} />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-2">
                <CardVariaveis 
                    title="Média PH" 
                    valueNum={num(data.mediaPh)}
                    display={Number.isNaN(data.mediaPh) ? "-" : num(data.mediaPh)}
                    type="ph" />
                <CardVariaveis 
                    title="Média Condutância" 
                    valueNum={num(data.mediaCondutancia)}
                    display={Number.isNaN(data.mediaCondutancia) ? "-" : `${num(data.mediaCondutancia)} µS/cm`}
                    type="condutancia" />
                <CardVariaveis                     
                    title="Média Turbidez" 
                    valueNum={num(data.mediaTurbidez)}
                    display={Number.isNaN(data.mediaTurbidez) ? "-" : `${num(data.mediaTurbidez)} NTU`}
                    type="turbidez" />
            </div>
        </div>
    )
}