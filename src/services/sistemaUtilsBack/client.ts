import { createAxiosClient } from "@/services/http/createAxiosClient";
import { SistemaUtilsBackApi } from "./sistemaUtilsBackApi";

export type CreateSistemaUtilsBackClientOptions = {
  baseURL?: string;
  debug?: boolean;
};

export const DEFAULT_SISTEMA_UTILS_BACK_BASE_URL = "http://72.60.142.80:9589";
export const SISTEMA_UTILS_BACK_DEV_PROXY_BASE_URL = "/utilsapi";

export const createSistemaUtilsBackClient = (options: CreateSistemaUtilsBackClientOptions = {}) => {
  const baseURL = options.baseURL
    ? options.baseURL
    : (import.meta.env.DEV
        ? SISTEMA_UTILS_BACK_DEV_PROXY_BASE_URL
        : DEFAULT_SISTEMA_UTILS_BACK_BASE_URL);

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

