import axios from "axios";

export async function extractAxiosErrorMessage(err: unknown): Promise<string> {
  if (!axios.isAxiosError(err)) return "Erro inesperado.";
  const status = err.response?.status;

  const msgFromJson = (err.response?.data as any)?.message;
  if (msgFromJson) return `(${status}) ${msgFromJson}`;

  if (err.response?.data instanceof Blob) {
    try {
      return `(${status}) ${err.message}`;
    } catch {

    }
  }
  return `(${status ?? "?"}) ${err.message}`;
}