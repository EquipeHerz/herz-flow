import { createAxiosClient } from "@/services/http/createAxiosClient";
import { LocalStorageTokenStore, type TokenStore } from "@/services/http/tokenStore";
import { SistemaLoginBackApi } from "./sistemaLoginBackApi";

export type CreateSistemaLoginBackClientOptions = {
  baseURL?: string;
  tokenStore?: TokenStore;
  debug?: boolean;
};

export const DEFAULT_SISTEMA_LOGIN_BACK_BASE_URL = "/api/loginBack";
export const SISTEMA_LOGIN_BACK_DEV_PROXY_BASE_URL = "/api/loginBack";

export const createSistemaLoginBackClient = (options: CreateSistemaLoginBackClientOptions = {}) => {
  const baseURL =
    options.baseURL ??
    (typeof import.meta.env.VITE_SISTEMA_LOGIN_BACK_URL === "string" &&
    import.meta.env.VITE_SISTEMA_LOGIN_BACK_URL.trim()
      ? import.meta.env.VITE_SISTEMA_LOGIN_BACK_URL.trim()
      : (import.meta.env.DEV
          ? SISTEMA_LOGIN_BACK_DEV_PROXY_BASE_URL
          : DEFAULT_SISTEMA_LOGIN_BACK_BASE_URL));
  const debug = options.debug ?? (import.meta.env.VITE_API_DEBUG === "true");

  const tokenStore =
    options.tokenStore ??
    new LocalStorageTokenStore("herz_auth_token", "herz_refresh_token");

  const http = createAxiosClient({
    baseURL,
    tokenStore,
    debug,
    defaultRetry: { retries: 2, baseDelayMs: 300 },
  });

  return {
    http,
    tokenStore,
    api: new SistemaLoginBackApi(http),
  };
};
