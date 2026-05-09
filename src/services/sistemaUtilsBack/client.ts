import { createAxiosClient } from "@/services/http/createAxiosClient";
import { SistemaUtilsBackApi } from "./sistemaUtilsBackApi";

export type CreateSistemaUtilsBackClientOptions = {
  baseURL?: string;
  debug?: boolean;
};

export const DEFAULT_SISTEMA_UTILS_BACK_BASE_URL = "/api/utilsapi";
export const SISTEMA_UTILS_BACK_DEV_PROXY_BASE_URL = "/api/utilsapi";

const normalizeUtilsBaseURL = (value: string) => {
  const trimmed = value.trim();
  const noTrailingSlash = trimmed.endsWith("/") ? trimmed.replace(/\/+$/, "") : trimmed;
  if (noTrailingSlash === "/utilsapi" || noTrailingSlash === "utilsapi") return "/api/utilsapi";
  return trimmed;
};

export const createSistemaUtilsBackClient = (options: CreateSistemaUtilsBackClientOptions = {}) => {
  const baseURL =
    options.baseURL ??
    (typeof import.meta.env.VITE_SISTEMA_UTILS_BACK_URL === "string" &&
    import.meta.env.VITE_SISTEMA_UTILS_BACK_URL.trim()
      ? normalizeUtilsBaseURL(import.meta.env.VITE_SISTEMA_UTILS_BACK_URL)
      : (import.meta.env.DEV
          ? SISTEMA_UTILS_BACK_DEV_PROXY_BASE_URL
          : DEFAULT_SISTEMA_UTILS_BACK_BASE_URL));

  const debug = options.debug ?? (import.meta.env.VITE_API_DEBUG === "true");

  const http = createAxiosClient({
    baseURL,
    debug,
    defaultRetry: { retries: 2, baseDelayMs: 300 },
  });

  return {
    http,
    api: new SistemaUtilsBackApi(http),
  };
};
