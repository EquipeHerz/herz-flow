import { describe, expect, it } from "vitest";
import { canCreateCompanies, canCreateUsers } from "./permissions";

describe("permissions", () => {
  it("blocks tipoUsuario=2 from create actions", () => {
    const user = {
      id: "u1",
      name: "X",
      email: "x@x.com",
      username: "x",
      corporateEmail: "x@x.com",
      phone: "",
      position: "",
      department: "",
      admissionDate: "",
      cpf: "",
      birthDate: "",
      address: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
      role: "ADMIN_EMPRESA",
      status: "active",
      tipoUsuario: 2,
    } as const;

    expect(canCreateCompanies(user as any)).toBe(false);
    expect(canCreateUsers(user as any)).toBe(false);
  });

  it("allows ADMIN_SISTEMA to create", () => {
    const user = {
      id: "u1",
      name: "X",
      email: "x@x.com",
      username: "x",
      corporateEmail: "x@x.com",
      phone: "",
      position: "",
      department: "",
      admissionDate: "",
      cpf: "",
      birthDate: "",
      address: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
      role: "ADMIN_SISTEMA",
      status: "active",
      tipoUsuario: 1,
    } as const;

    expect(canCreateCompanies(user as any)).toBe(true);
    expect(canCreateUsers(user as any)).toBe(true);
  });
});

