import { api } from "../../lib/axios";

export type CardsDTO = {
    abertas: number;
    total: number;
    mediaPh: number | string;
    mediaCondutancia: number | string;
    mediaTurbidez: number | string;
};

export const getCards = async (): Promise<CardsDTO> =>
    (await api.get("/api/v1/dashboard/cards")).data;

export type StatusSplitDTO = {
    aprovados: number;
    reprovados: number;
};

export const getStatus = async (): Promise<StatusSplitDTO> =>
    (await api.get("/api/v1/dashboard/status")).data;

export type SeriesDTO = {
    dia: string;
    valor: number | null
}
export const getSeries = async (metric: "PH" | "CONDUTANCIA" | "TURBIDEZ", days = 30): Promise<SeriesDTO []> =>
    (await api.get("/api/v1/dashboard/series", { params: { metric, days } })).data