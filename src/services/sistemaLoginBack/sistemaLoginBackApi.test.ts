import { describe, expect, it } from "vitest";
import type { AxiosAdapter } from "axios";
import { createAxiosClient } from "@/services/http/createAxiosClient";
import { MemoryTokenStore } from "@/services/http/tokenStore";
import { SistemaLoginBackApi } from "./sistemaLoginBackApi";

const okResponse = (config: any, data: unknown, status = 200, headers: Record<string, string> = {}) => ({
  data,
  status,
  statusText: String(status),
  headers,
  config,
});

describe("SistemaLoginBackApi", () => {
  it("extracts jwt from response body authToken", async () => {
    const store = new MemoryTokenStore();
    const client = createAxiosClient({ baseURL: "http://example.test", tokenStore: store });

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/login") {
        return okResponse(config, { authToken: "jwt-1", nome: "Maria", login: "maria" });
      }
      return okResponse(config, {});
    };
    (client.defaults as any).adapter = adapter;

    const api = new SistemaLoginBackApi(client);
    const res = await api.login({ login: "maria", password: "12345678" });

    expect(res.jwt).toBe("jwt-1");
    expect(res.user.login).toBe("maria");
  });

  it("normalizes bearer token from response body", async () => {
    const store = new MemoryTokenStore();
    const client = createAxiosClient({ baseURL: "http://example.test", tokenStore: store });

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/login") {
        return okResponse(config, { token: "Bearer jwt-2", nome: "Maria", login: "maria" });
      }
      return okResponse(config, {});
    };
    (client.defaults as any).adapter = adapter;

    const api = new SistemaLoginBackApi(client);
    const res = await api.login({ login: "maria", password: "12345678" });
    expect(res.jwt).toBe("jwt-2");
  });

  it("throws when login returns no token", async () => {
    const store = new MemoryTokenStore();
    const client = createAxiosClient({ baseURL: "http://example.test", tokenStore: store });

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/login") {
        return okResponse(config, { nome: "Maria" });
      }
      return okResponse(config, {});
    };
    (client.defaults as any).adapter = adapter;

    const api = new SistemaLoginBackApi(client);
    const res = await api.login({ login: "maria", password: "12345678" });
    expect(res.jwt).toBe("");
  });
});
