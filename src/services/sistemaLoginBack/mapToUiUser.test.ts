import { describe, expect, it } from "vitest";
import { mapApiUsuarioToUiUser } from "./mapToUiUser";

describe("mapApiUsuarioToUiUser", () => {
  it("maps tipoUsuario 1 to ADMIN_SISTEMA", () => {
    const user = mapApiUsuarioToUiUser({
      id: "u1",
      login: "qualquer",
      email: "qualquer@empresa.com",
      tipoUsuario: 1,
    });

    expect(user.role).toBe("ADMIN_SISTEMA");
    expect(user.id).toBe("u1");
  });

  it("does not elevate by login/email", () => {
    const user = mapApiUsuarioToUiUser({
      id: "u2",
      login: "usuario.teste",
      email: "x@y.com",
      tipoUsuario: 2,
    });

    expect(user.role).toBe("ADMIN_EMPRESA");
  });

  it("defaults to ADMIN_EMPRESA", () => {
    const user = mapApiUsuarioToUiUser({
      id: "u3",
      login: "admin.empresa",
      email: "admin@empresa.com",
      tipoUsuario: 2,
    });

    expect(user.role).toBe("ADMIN_EMPRESA");
  });
});
