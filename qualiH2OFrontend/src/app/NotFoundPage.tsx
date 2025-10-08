import { useEffect, useRef } from "react";

export function NotFoundPage() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div
            ref={ref}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="mx-auto mt-10 max-w-lg rounded-2xl border bg-white p-6 shadow-sm"
        >
            <h1 className="text-2xl font-bold">(404) Página não encontrada</h1>
            <p className="mt-2 text-zinc-700">
                O recurso solicitado não existe. Verifique o endereço ou volte para a página inicial.
            </p>
            <a
                href="/"
                className="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-zinc-50"
                aria-label="Voltar para a página inicial"
            >
                Voltar para o início
            </a>
        </div>
    );
}
