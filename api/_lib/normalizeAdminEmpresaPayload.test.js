import { describe, expect, it } from "vitest";
import { normalizeAdminEmpresaPayload } from "./normalizeAdminEmpresaPayload.js";

describe("normalizeAdminEmpresaPayload", () => {
  it("removes password fields when empty", () => {
    const { payload, audit } = normalizeAdminEmpresaPayload({
      cnpj: "34432780000160",
      Usuario: { id: "u1", login: "flavia", senhaAtual: "", senhaNova: null },
    });

    expect(payload.Usuario.senhaAtual).toBeUndefined();
    expect(payload.Usuario.senhaNova).toBeUndefined();
    expect(audit.passwordAction).toBe("preserved");
  });

  it("keeps password fields when provided", () => {
    const { payload, audit } = normalizeAdminEmpresaPayload({
      cnpj: "34432780000160",
      usuario: { id: "u1", login: "flavia", senhaAtual: "A", senhaNova: "B" },
    });

    expect(payload.usuario.senhaAtual).toBe("A");
    expect(payload.usuario.senhaNova).toBe("B");
    expect(audit.passwordAction).toBe("changed");
  });
});

