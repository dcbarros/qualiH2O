import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aceitarAnalise, fetchRelatorioPdf, atualizaAmostra, removeAnalise } from "../api";
import type { AnaliseDTO } from "../api";
import { openBlobInNewTab } from "../../../lib/download";
import { useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { extractAxiosErrorMessage } from "../../../lib/httpError";
import { Check, FileText, Pencil, Trash2, Loader2, Ban } from "lucide-react";

type EditForm = {
  analista: string;
  local: string;
  descricao?: string;
  ph: number;
  turbidez: number;
  condutancia: number;
  horaDaAmostragem: string; 
};

export function ActionsCell({ a }: { a: AnaliseDTO }) {
  const qc = useQueryClient();
  const [downloading, setDownloading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ====== ACCEPT ======
  const { mutateAsync: doAccept, isPending: accepting } = useMutation({
    mutationFn: (codigo: string) => aceitarAnalise(codigo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analises"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "cards"] });
      toast.success("Análise aceita com sucesso.");
    },
    onError: async (err) => toast.error(await extractAxiosErrorMessage(err)),
  });

  const handleAccept = async () => {
    if (!a.codigo) return toast.error("Código da análise ausente.");
    await doAccept(a.codigo);
  };

  // ====== PDF ======
  const handlePdf = async () => {
    if (!a.codigo) return toast.error("Código da análise ausente.");
    setDownloading(true);
    const p = fetchRelatorioPdf(a.codigo)
      .then((blob) => openBlobInNewTab(blob, `analise_${a.codigo}.pdf`))
      .catch(async (err) => toast.error(await extractAxiosErrorMessage(err)))
      .finally(() => setDownloading(false));

    await toast.promise(p, {
      loading: "Gerando PDF...",
      success: "PDF pronto!",
      error: "Falha ao gerar PDF.",
    });
  };

  // ====== EDIT ======
  const [form, setForm] = useState<EditForm>(() => ({
    analista: a.analista ?? "",
    local: a.local ?? "",
    descricao: a.descricao ?? "",
    ph: Number(a.ph ?? 0),
    turbidez: Number(a.turbidez ?? 0),
    condutancia: Number(a.condutancia ?? 0),
    horaDaAmostragem: toLocalDatetimeValue(a.horaDaAmostragem),
  }));

  useEffect(() => {
    if (editOpen) {
      setForm({
        analista: a.analista ?? "",
        local: a.local ?? "",
        descricao: a.descricao ?? "",
        ph: Number(a.ph ?? 0),
        turbidez: Number(a.turbidez ?? 0),
        condutancia: Number(a.condutancia ?? 0),
        horaDaAmostragem: toLocalDatetimeValue(a.horaDaAmostragem),
      });
    }
  }, [a]);

  const { mutateAsync: doEdit, isPending: saving } = useMutation({
    mutationFn: (payload: EditForm) =>
      atualizaAmostra(a.codigo!, {
        analista: payload.analista,
        local: payload.local,
        descricao: payload.descricao,
        ph: payload.ph,
        turbidez: payload.turbidez,
        condutancia: payload.condutancia,
        horaDaAmostragem: new Date(payload.horaDaAmostragem + "Z").toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analises"] });
      toast.success("Análise atualizada.");
      setEditOpen(false);
    },
    onError: async (err) => toast.error(await extractAxiosErrorMessage(err)),
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!a.codigo) return toast.error("Código da análise ausente.");
    await doEdit(form);
  };

  // ====== DELETE ======
  const { mutateAsync: doDelete, isPending: deleting } = useMutation({
    mutationFn: (codigo: string) => removeAnalise(codigo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analises"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "cards"] });
      toast.success("Análise excluída.");
      setDeleteOpen(false);
    },
    onError: async (err) => toast.error(await extractAxiosErrorMessage(err)),
  });

  const handleDelete = async () => {
    if (!a.codigo) return toast.error("Código da análise ausente.");
    await doDelete(a.codigo);
  };

  const canAccept = !a.aceiteRelatorio;
  const canPdf = a.aceiteRelatorio;

  const isPrimaryBusy = canAccept ? accepting : downloading;
  const isPrimaryDisabled = canAccept
    ? accepting                          
    : !canPdf || downloading;            

  const primaryClass =
    "flex items-center gap-1 rounded px-2 py-1 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed " +
    (canAccept ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600");

  const primaryTitle = canAccept
    ? "Confirmar aceite"
    : (canPdf ? "Emitir relatório" : "Necessário aceite");

  const onPrimaryClick = canAccept ? handleAccept : handlePdf;

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPrimaryDisabled}
        onClick={onPrimaryClick}
        className={primaryClass}
        title={primaryTitle}
        aria-busy={isPrimaryBusy}
      >
        {isPrimaryBusy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : canAccept ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">
          {canAccept ? "Aceitar" : "Relatório"}
        </span>
      </button>


      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700"
        title="Editar análise"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar</span>
      </button>


      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700"
        title="Excluir análise"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Excluir</span>
      </button>

      {editOpen && (
        <Dialog onClose={() => setEditOpen(false)} title={`Editar análise ${a.codigo}`}>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Analista">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.analista}
                  onChange={(e) => setForm((f) => ({ ...f, analista: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Local">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.local}
                  onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Data/Hora da amostragem" className="col-span-2">
                <input
                  type="datetime-local"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.horaDaAmostragem}
                  onChange={(e) => setForm((f) => ({ ...f, horaDaAmostragem: e.target.value }))}
                  required
                />
              </Field>
              <Field label="pH">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={14}
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.ph}
                  onChange={(e) => setForm((f) => ({ ...f, ph: Number(e.target.value) }))}
                  required
                />
              </Field>
              <Field label="Turbidez (NTU)">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.turbidez}
                  onChange={(e) => setForm((f) => ({ ...f, turbidez: Number(e.target.value) }))}
                  required
                />
              </Field>
              <Field label="Condutância (µS/cm)">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={form.condutancia}
                  onChange={(e) => setForm((f) => ({ ...f, condutancia: Number(e.target.value) }))}
                  required
                />
              </Field>
              <Field label="Observações" className="col-span-2">
                <textarea
                  className="w-full rounded border px-2 py-1 text-sm"
                  rows={3}
                  value={form.descricao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-white bg-rose-400 hover:bg-rose-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              >
                <div className="flex items-center">
                  <Ban className="h-4 w-4" />
                  <p className="ms-2">Cancelar</p>
                </div>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-white bg-sky-400 hover:bg-sky-500 font-medium rounded-lg text-sm px-5 py-2.5  mb-2"
              >
                <div className="flex items-center">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  <p className="ms-2">Editar</p>
                </div>
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {deleteOpen && (
        <Dialog onClose={() => setDeleteOpen(false)} title={`Excluir análise ${a.codigo}`}>
          <p className="text-sm">
            Tem certeza que deseja <strong>excluir</strong> a análise <code>{a.codigo}</code>? Esta ação não pode ser desfeita.
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3">
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function toLocalDatetimeValue(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
