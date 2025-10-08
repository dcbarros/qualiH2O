import { useParams } from "react-router-dom";

export function AnaliseDetailPage() {

    const { id } = useParams();
    return (
        <div>
            <h2 className="text-xl font-semibold">Análise #{id}</h2>
            <div className="rounded-xl border bg-white p-4">Detalhes…</div>
        </div>
    )
}