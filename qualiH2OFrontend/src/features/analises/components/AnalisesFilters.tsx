import { useQuery } from "@tanstack/react-query";
import { getOpcoesFiltros } from "../api";
import { useDebounce } from "../../../hooks/useDebounce";
import { useEffect, useState } from "react";
import { Eraser } from "lucide-react";
import { NewAnaliseButton } from "./NewAnaliseButton";
export type FiltersState = {
    codigo: string;
    analista: string;     // "" = todos
    local: string;        // "" = todos
    status: "TODOS" | "APROVADA" | "REPROVADA";
    aceite: "TODOS" | "ACEITA" | "PENDENTE";
};

const initial: FiltersState = {
    codigo: "",
    analista: "",
    local: "",
    status: "TODOS",
    aceite: "TODOS",
};

export function AnalisesFilters(props: {
    value?: FiltersState;
    onChange: (f: FiltersState) => void;
    onSubmit?: () => void;
}) {
    const [localState, setLocalState] = useState<FiltersState>(props.value ?? initial);
    const debouncedCodigo = useDebounce(localState.codigo, 400);

    const { data: opcoes } = useQuery({
        queryKey: ["analises", "opcoes"],
        queryFn: getOpcoesFiltros,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        props.onChange({
            ...localState,
            codigo: debouncedCodigo,
        });
    }, [debouncedCodigo, localState.analista, localState.local, localState.status, localState.aceite]);

    const limpar = () => {
        setLocalState(initial);
        props.onChange(initial);
    };

    return (
        <div className="rounded-2xl border border-sky-600 bg-white p-3">
            <h1 className="text-sky-600 text-lg mb-3 font-semibold">Filtros</h1>
            <div className="grid md:grid-cols-5 gap-3">
                <div>
                    <label className="text-sky-600 block text-xs font-medium mb-1">Código</label>
                    <input
                        type="text"
                        placeholder="AM-20251004-001..."
                        value={localState.codigo}
                        onChange={(e) => setLocalState(s => ({ ...s, codigo: e.target.value }))}
                        className="w-full rounded-lg border border-sky-600 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-sky-600 mb-1">Analista</label>
                    <select
                        value={localState.analista}
                        onChange={(e) => setLocalState(s => ({ ...s, analista: e.target.value }))}
                        className="w-full rounded-lg border border-sky-600 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                        <option value="">Todos</option>
                        {(opcoes?.analistas ?? []).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-sky-600 mb-1">Local</label>
                    <select
                        value={localState.local}
                        onChange={(e) => setLocalState(s => ({ ...s, local: e.target.value }))}
                        className="w-full rounded-lg border border-sky-600 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                        <option value="">Todos</option>
                        {(opcoes?.locais ?? []).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-sky-600 mb-1">Status</label>
                    <select
                        value={localState.status}
                        onChange={(e) => setLocalState(s => ({ ...s, status: e.target.value as any }))}
                        className="w-full rounded-lg border border-sky-600 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="APROVADA">Aprovada</option>
                        <option value="REPROVADA">Reprovada</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-sky-600 mb-1">Aceite</label>
                    <select
                        value={localState.aceite}
                        onChange={(e) => setLocalState(s => ({ ...s, aceite: e.target.value as any }))}
                        className="w-full rounded-lg border border-sky-600 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ACEITA">Aceita</option>
                        <option value="PENDENTE">Pendente</option>
                    </select>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-end">
                <button
                    type="button"
                    className="text-white bg-sky-600 hover:bg-sky-500 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    onClick={limpar}
                >
                    <div className="flex items-center">
                        <Eraser className="h-3.5 w-3.5 me-2" />
                        <p>Limpar Campos</p>
                    </div>


                </button>
                <NewAnaliseButton />
            </div>
        </div>
    );
}
