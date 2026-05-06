import axios, { type AxiosError } from "axios";
import { ZodError } from "zod";

export type ApiErrorKind = "http" | "network" | "timeout" | "cancelled" | "unknown";

type ApiErrorInit = {
  message: string;
  kind: ApiErrorKind;
  status?: number;
  method?: string;
  url?: string;
  data?: unknown;
  original?: unknown;
};

const defaultMessageForStatus = (status: number | undefined) => {
  if (!status) return "Falha ao se comunicar com o servidor.";
  if (status === 400) return "Requisição inválida.";
  if (status === 401) return "Não autenticado.";
  if (status === 403) return "Acesso negado.";
  if (status === 404) return "Recurso não encontrado.";
  if (status >= 500) return "Erro interno do servidor.";
  return "Erro inesperado.";
};

const extractMessageFromData = (data: unknown): string | null => {
  if (!data) return null;

  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  const msg =
    (typeof obj.message === "string" && obj.message.trim()) ||
    (typeof obj.mensagem === "string" && obj.mensagem.trim()) ||
    (typeof obj.detail === "string" && obj.detail.trim()) ||
    (typeof obj.title === "string" && obj.title.trim());

  if (msg) return msg;

  const errors = obj.errors;
  if (errors && typeof errors === "object") {
    const eobj = errors as Record<string, unknown>;
    const parts: string[] = [];
    for (const [field, value] of Object.entries(eobj)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        parts.push(`${field}: ${value[0]}`);
      } else if (typeof value === "string") {
        parts.push(`${field}: ${value}`);
      }
      if (parts.length >= 3) break;
    }
    if (parts.length) return parts.join(" | ");
  }

  return null;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly method?: string;
  readonly url?: string;
  readonly data?: unknown;
  readonly original?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status;
    this.method = init.method;
    this.url = init.url;
    this.data = init.data;
    this.original = init.original;
  }

  static fromUnknown(error: unknown, customMessage?: string) {
    if (error instanceof ApiError) {
      if (!customMessage) return error;
      return new ApiError({
        kind: error.kind,
        status: error.status,
        method: error.method,
        url: error.url,
        data: error.data,
        original: error.original,
        message: customMessage,
      });
    }

    if (axios.isCancel(error)) {
      return new ApiError({
        kind: "cancelled",
        message: customMessage ?? "Requisição cancelada.",
        original: error,
      });
    }

    if (axios.isAxiosError(error)) {
      const ax = error as AxiosError;
      const status = ax.response?.status;
      const method = ax.config?.method?.toUpperCase();
      const url = ax.config?.url;
      const data = ax.response?.data;

      if (!ax.response) {
        const isTimeout =
          ax.code === "ECONNABORTED" ||
          (typeof ax.message === "string" && ax.message.toLowerCase().includes("timeout"));
        return new ApiError({
          kind: isTimeout ? "timeout" : "network",
          status,
          method,
          url,
          data,
          message: customMessage ?? "Falha de rede ao se comunicar com o servidor.",
          original: error,
        });
      }

      const fromData = extractMessageFromData(data);
      return new ApiError({
        kind: "http",
        status,
        method,
        url,
        data,
        message: fromData ?? customMessage ?? defaultMessageForStatus(status),
        original: error,
      });
    }

    if (error instanceof ZodError) {
      const first = error.issues[0];
      const path = first?.path?.length ? first.path.join(".") : "payload";
      const msg = first?.message ? `${path}: ${first.message}` : "Payload inválido.";
      return new ApiError({
        kind: "unknown",
        message: customMessage ? `${customMessage} ${msg}` : msg,
        original: error,
      });
    }

    if (error instanceof Error) {
      return new ApiError({
        kind: "unknown",
        message: customMessage ?? error.message,
        original: error,
      });
    }

    return new ApiError({
      kind: "unknown",
      message: customMessage ?? "Erro desconhecido.",
      original: error,
    });
  }
}
