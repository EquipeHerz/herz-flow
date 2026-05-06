import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./apiError";
import type { TokenStore, Tokens } from "./tokenStore";
import { getAuthTokenFromCookies } from "./authCookie";

export type RetryOptions = {
  retries: number;
  baseDelayMs?: number;
  retryOnStatuses?: number[];
  retryOnMethods?: string[];
};

export type ApiLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export type RefreshAccessTokenFn = (tokens: Tokens) => Promise<Partial<Tokens> | null>;

type ExtendedConfig = InternalAxiosRequestConfig & {
  retry?: RetryOptions;
  skipAuth?: boolean;
  _retryCount?: number;
  _authRefreshed?: boolean;
  _requestStartedAt?: number;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const jitter = (ms: number) => {
  const delta = Math.floor(ms * 0.2);
  return ms - delta + Math.floor(Math.random() * (2 * delta + 1));
};

const normalizeBearerToken = (value: string) => value.trim().replace(/^bearer\s+/i, "");

const shouldRetry = (config: ExtendedConfig, status?: number) => {
  const retry = config.retry;
  if (!retry) return false;

  const retries = retry.retries ?? 0;
  const count = config._retryCount ?? 0;
  if (count >= retries) return false;

  const method = (config.method ?? "GET").toUpperCase();
  const methods = retry.retryOnMethods ?? ["GET", "HEAD", "OPTIONS"];
  if (!methods.includes(method)) return false;

  if (status == null) return true;
  const statuses = retry.retryOnStatuses ?? [408, 429, 500, 502, 503, 504];
  return statuses.includes(status);
};

const toSafeLogPayload = (value: unknown) => {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value;
  const obj = value as Record<string, unknown>;
  const redactedKeys = new Set([
    "senha",
    "senhaAtual",
    "senhaNova",
    "password",
    "refreshToken",
    "authToken",
    "token",
  ]);
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    clone[k] = redactedKeys.has(k) ? "[REDACTED]" : v;
  }
  return clone;
};

export type CreateAxiosClientOptions = {
  baseURL: string;
  tokenStore?: TokenStore;
  refreshAccessToken?: RefreshAccessTokenFn;
  logger?: ApiLogger;
  defaultRetry?: RetryOptions;
  debug?: boolean;
};

export const createAxiosClient = (options: CreateAxiosClientOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: 30_000,
    validateStatus: (status) => status >= 200 && status < 300,
    withCredentials: true,
  });

  const logger: ApiLogger = options.logger ?? console;
  const debug = options.debug ?? false;
  const tokenStore = options.tokenStore;
  const refreshAccessToken = options.refreshAccessToken;

  let refreshPromise: Promise<Partial<Tokens> | null> | null = null;

  instance.interceptors.request.use((rawConfig) => {
    const config = rawConfig as ExtendedConfig;
    config._requestStartedAt = Date.now();

    if (!config.retry && options.defaultRetry) {
      config.retry = options.defaultRetry;
    }

    if (!config.skipAuth && tokenStore) {
      const { accessToken } = tokenStore.getTokens();
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${normalizeBearerToken(accessToken)}`;
      }
    }

    if (!config.skipAuth && (!config.headers || !("Authorization" in config.headers))) {
      const cookieToken = getAuthTokenFromCookies();
      if (cookieToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${normalizeBearerToken(cookieToken)}`;
      }
    }

    if (debug) {
      const headersObj = (config.headers ?? {}) as any;
      const hasAuthorization =
        typeof headersObj?.Authorization === "string"
          ? true
          : typeof headersObj?.authorization === "string"
            ? true
            : false;
      const payload = {
        method: (config.method ?? "GET").toUpperCase(),
        url: config.url,
        params: config.params,
        data: toSafeLogPayload(config.data),
        auth: { hasAuthorization },
      };
      logger.debug("[api] request", payload);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (debug) {
        const config = response.config as ExtendedConfig;
        const duration = config._requestStartedAt ? Date.now() - config._requestStartedAt : undefined;
        const payload = {
          method: (config.method ?? "GET").toUpperCase(),
          url: config.url,
          status: response.status,
          durationMs: duration,
          data: toSafeLogPayload(response.data),
        };
        logger.debug("[api] response", payload);
      }
      return response;
    },
    async (error: unknown) => {
      const apiError = ApiError.fromUnknown(error);

      if (!axios.isAxiosError(error) || !error.config) {
        throw apiError;
      }

      const config = error.config as ExtendedConfig;
      const status = error.response?.status;
      const duration = config._requestStartedAt ? Date.now() - config._requestStartedAt : undefined;

      if (debug) {
        const payload = {
          method: (config.method ?? "GET").toUpperCase(),
          url: config.url,
          status,
          durationMs: duration,
          request: {
            params: config.params,
            data: toSafeLogPayload(config.data),
          },
          response: {
            data: toSafeLogPayload(error.response?.data),
          },
        };
        logger.error("[api] error", payload);
      }

      if (
        status === 401 &&
        !config.skipAuth &&
        refreshAccessToken &&
        tokenStore &&
        !config._authRefreshed
      ) {
        config._authRefreshed = true;

        const currentTokens = tokenStore.getTokens();

        refreshPromise =
          refreshPromise ??
          refreshAccessToken(currentTokens).finally(() => {
            refreshPromise = null;
          });

        const newTokens = await refreshPromise;

        if (newTokens?.accessToken) {
          tokenStore.setTokens(newTokens);
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return instance.request(config);
        }

        tokenStore.clear();
        throw new ApiError({
          kind: "http",
          status: 401,
          method: config.method?.toUpperCase(),
          url: config.url,
          message: "Sessão expirada. Faça login novamente.",
          original: error,
        });
      }

      if (shouldRetry(config, status)) {
        config._retryCount = (config._retryCount ?? 0) + 1;
        const base = config.retry?.baseDelayMs ?? 300;
        const delay = jitter(base * 2 ** (config._retryCount - 1));

        if (debug) {
          logger.warn("[api] retry", {
            method: (config.method ?? "GET").toUpperCase(),
            url: config.url,
            status,
            attempt: config._retryCount,
            delayMs: delay,
          });
        }

        await sleep(delay);
        return instance.request(config);
      }

      throw apiError;
    }
  );

  return instance;
};
