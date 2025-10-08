import { useState, useMemo, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Ban } from "lucide-react";
import toast from "react-hot-toast";
import { adicionaAmostra } from "../api";
import { extractAxiosErrorMessage } from "../../../lib/httpError";

type CreateForm = {
  analista: string;
  local: string;
  descricao?: string;
  ph: number;
  turbidez: number;
  condutancia: number;
  horaDaAmostragem: string; // yyyy-MM-ddTHH:mm (input datetime-local)
};

export function NewAnaliseButton() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const defaultDatetime = useMemo(() => toLocalDatetimeNow(), []);
  const [form, setForm] = useState<CreateForm>({
    analista: "",
    local: "",
    descricao: "",
    ph: 7,
    turbidez: 0,
    condutancia: 300,
    horaDaAmostragem: defaultDatetime,
  });

  const { mutateAsync: doCreate, isPending: creating } = useMutation({
    mutationFn: () =>
      adicionaAmostra({
        analista: form.analista,
        local: form.local,
        descricao: form.descricao,
        ph: form.ph,
        turbidez: form.turbidez,
        condutancia: form.condutancia,
        horaDaAmostragem: new Date(form.horaDaAmostragem).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Análise criada com sucesso.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["analises"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "cards"] });
    },
    onError: async (err) => {
      toast.error(await extractAxiosErrorMessage(err));
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.ph < 0 || form.ph > 14) return toast.error("pH deve estar entre 0 e 14.");
    if (form.turbidez < 0) return toast.error("Turbidez deve ser positiva.");
    if (form.condutancia < 0) return toast.error("Condutância deve ser positiva.");
    if (!form.analista?.trim() || !form.local?.trim()) return toast.error("Analista e Local são obrigatórios.");

    await doCreate();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-white bg-sky-600 hover:bg-sky-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
        title="Criar nova análise"
      >
        <div className="flex items-center">
          <Plus className="h-3.5 w-3.5 me-2" />
          <p>Novos Campos</p>
        </div>
      </button>

      {open && (
        <Dialog onClose={() => setOpen(false)} title="Nova análise">
          <form onSubmit={onSubmit} className="space-y-3">
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
                onClick={() => setOpen(false)}
                className="text-white bg-rose-400 hover:bg-rose-500 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              >
                <div className="flex items-center">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  <p className="ms-2">Cancelar</p>
                </div>

              </button>
              <button
                type="submit"
                disabled={creating}
                className="text-white bg-emerald-400 hover:bg-emerald-500 font-medium rounded-lg text-sm px-5 py-2.5  mb-2"
              >
                <div className="flex items-center">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <p className="ms-2">Criar</p>
                </div>
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
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

function toLocalDatetimeNow() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
