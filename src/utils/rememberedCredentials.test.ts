import { describe, expect, it, beforeEach } from "vitest";
import { webcrypto } from "node:crypto";
import {
  clearRememberedCredentials,
  loadRememberedCredentials,
  saveRememberedCredentials,
} from "./rememberedCredentials";

describe("rememberedCredentials", () => {
  beforeEach(() => {
    (globalThis as any).crypto ??= webcrypto as any;
    localStorage.clear();
  });

  it("saves and loads credentials", async () => {
    await saveRememberedCredentials({ login: "user@example.com", password: "Secret123!" }, 30);
    const loaded = await loadRememberedCredentials();
    expect(loaded).toEqual({ login: "user@example.com", password: "Secret123!" });
  });

  it("clears credentials", async () => {
    await saveRememberedCredentials({ login: "user@example.com", password: "Secret123!" }, 30);
    clearRememberedCredentials();
    const loaded = await loadRememberedCredentials();
    expect(loaded).toBeNull();
  });
});

