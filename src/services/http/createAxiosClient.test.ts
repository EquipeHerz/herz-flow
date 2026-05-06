import { describe, expect, it, vi } from "vitest";
import type { AxiosAdapter } from "axios";
import { AxiosError } from "axios";
import { createAxiosClient } from "./createAxiosClient";
import { MemoryTokenStore } from "./tokenStore";

const okResponse = (config: any, data: unknown, status = 200) => ({
  data,
  status,
  statusText: String(status),
  headers: {},
  config,
});

describe("createAxiosClient", () => {
  it("adds Authorization header when token exists", async () => {
    const store = new MemoryTokenStore();
    store.setTokens({ accessToken: "token-123" });

    const calls: any[] = [];
    const adapter: AxiosAdapter = async (config) => {
      calls.push(config);
      return okResponse(config, { ok: true });
    };

    const client = createAxiosClient({ baseURL: "http://example.test", tokenStore: store });
    (client.defaults as any).adapter = adapter;

    await client.get("/ping");

    expect(calls).toHaveLength(1);
    expect(calls[0].headers.Authorization).toBe("Bearer token-123");
  });

  it("retries on network error for GET by defaultRetry", async () => {
    const store = new MemoryTokenStore();

    let attempt = 0;
    const adapter: AxiosAdapter = async (config) => {
      attempt += 1;
      if (attempt === 1) {
        throw new AxiosError("Network Error", "ERR_NETWORK", config);
      }
      return okResponse(config, { ok: true });
    };

    const client = createAxiosClient({
      baseURL: "http://example.test",
      tokenStore: store,
      defaultRetry: { retries: 2, baseDelayMs: 1 },
    });
    (client.defaults as any).adapter = adapter;

    const res = await client.get("/unstable");
    expect(res.data).toEqual({ ok: true });
    expect(attempt).toBe(2);
  });

  it("refreshes token on 401 and retries once", async () => {
    const store = new MemoryTokenStore();
    store.setTokens({ accessToken: "old-token", refreshToken: "r1" });

    const refresh = vi.fn(async () => ({ accessToken: "new-token" }));

    const calls: any[] = [];
    const adapter: AxiosAdapter = async (config) => {
      calls.push({ url: config.url, auth: (config.headers as any)?.Authorization });
      if (calls.length === 1) {
        const response = okResponse(config, { message: "nope" }, 401);
        throw new AxiosError(
          "Request failed with status code 401",
          "ERR_BAD_REQUEST",
          config,
          null,
          response
        );
      }
      return okResponse(config, { ok: true }, 200);
    };

    const client = createAxiosClient({
      baseURL: "http://example.test",
      tokenStore: store,
      refreshAccessToken: refresh,
    });
    (client.defaults as any).adapter = adapter;

    const res = await client.get("/needs-auth");

    expect(res.data).toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(calls[0].auth).toBe("Bearer old-token");
    expect(calls[1].auth).toBe("Bearer new-token");
  });
});
