import { api } from "../../lib/axios";

/** ===== Tipos ===== */

export type AnaliseDTO = {
  id: number;
  codigo: string;
  analista: string;
  local: string;
  horaDaAmostragem: string; // ISO
  ph: number;
  turbidez: number;
  condutancia: number;
  statusDaAmostra: boolean;
  aceiteRelatorio: boolean;
  descricao?: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0-based)
  size: number;
};

export type AnaliseFilters = {
  codigo?: string;                               
  analista?: string;                             
  local?: string;                                
  status?: "TODOS" | "APROVADA" | "REPROVADA";   
  aceite?: "TODOS" | "ACEITA" | "PENDENTE";      
};

export type OpcoesFiltros = {
  analistas: string[];
  locais: string[];
};

/** ===== Helpers internos ===== */

function mapStatusToBool(s?: AnaliseFilters["status"]): boolean | undefined {
  if (!s || s === "TODOS") return undefined;
  return s === "APROVADA";
}

function mapAceiteToBool(a?: AnaliseFilters["aceite"]): boolean | undefined {
  if (!a || a === "TODOS") return undefined;
  return a === "ACEITA";
}

/** ===== Listagem (com filtros) =====
 * GET /api/v1/analises?codigo&analista&local&status&aceite&page&size&sort
 */
export const listAnalises = async (
  page = 0,
  size = 10,
  sort = "horaDaAmostragem,DESC",
  filters: AnaliseFilters = {}
): Promise<Page<AnaliseDTO>> => {
  const params: Record<string, any> = { page, size, sort };

  if (filters.codigo && filters.codigo.trim() !== "") params.codigo = filters.codigo.trim();
  if (filters.analista) params.analista = filters.analista;
  if (filters.local) params.local = filters.local;

  const statusBool = mapStatusToBool(filters.status);
  if (typeof statusBool === "boolean") params.status = statusBool;

  const aceiteBool = mapAceiteToBool(filters.aceite);
  if (typeof aceiteBool === "boolean") params.aceite = aceiteBool;

  const { data } = await api.get<Page<AnaliseDTO>>("/api/v1/analises", { params });
  return data;
};

/** ===== Opções para filtros =====
 * GET /api/v1/analises/opcoes -> { analistas:[], locais:[] }
 */
export const getOpcoesFiltros = async (): Promise<OpcoesFiltros> => {
  const { data } = await api.get<OpcoesFiltros>("/api/v1/analises/opcoes");
  return data;
};

/** ===== CRUD ===== */

// Create
export type AnaliseCreateDTO = {
  analista: string;
  local: string;
  horaDaAmostragem: string; // ISO
  ph: number;
  turbidez: number;
  condutancia: number;
  descricao?: string;
};

export const adicionaAmostra = async (
  payload: AnaliseCreateDTO
): Promise<AnaliseDTO> => {
  const { data } = await api.post<AnaliseDTO>("/api/v1/analises", payload);
  return data;
};

// Update por CÓDIGO (conforme seu backend atual)
export type AnaliseUpdateDTO = {
  analista: string;
  local: string;
  horaDaAmostragem: string; // ISO
  ph: number;
  turbidez: number;
  condutancia: number;
  descricao?: string;
};

export const atualizaAmostra = async (
  codigo: string,
  payload: AnaliseUpdateDTO
): Promise<AnaliseDTO> => {
  const { data } = await api.put<AnaliseDTO>(`/api/v1/analises/${encodeURIComponent(codigo)}`, payload);
  return data;
};

// Get por CÓDIGO
export const getAnaliseByCodigo = async (codigo: string): Promise<AnaliseDTO> => {
  const { data } = await api.get<AnaliseDTO>(`/api/v1/analises/${encodeURIComponent(codigo)}`);
  return data;
};

// Delete por CÓDIGO
export const removeAnalise = async (codigo: string): Promise<void> => {
  await api.delete(`/api/v1/analises/${encodeURIComponent(codigo)}`);
};

/** ===== Ações ===== */

// PATCH /{codigo}/aceite
export const aceitarAnalise = async (codigo: string): Promise<AnaliseDTO> => {
  const { data } = await api.patch<AnaliseDTO>(`/api/v1/analises/${encodeURIComponent(codigo)}/aceite`);
  return data;
};

// GET /{codigo}/relatorio.pdf
export const fetchRelatorioPdf = async (codigo: string): Promise<Blob> => {
  const res = await api.get(`/api/v1/analises/${encodeURIComponent(codigo)}/relatorio.pdf`, {
    responseType: "blob",
  });
  return res.data as Blob;
};

/** ===== Util ===== */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
