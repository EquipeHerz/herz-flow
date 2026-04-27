import { describe, expect, it } from "vitest";
import { isValidCPF, publicRegistrationSchema } from "./publicRegistration";

describe("publicRegistration", () => {
  it("validates CPF correctly", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("111.111.111-11")).toBe(false);
    expect(isValidCPF("123.456.789-00")).toBe(false);
  });

  it("rejects password mismatch", () => {
    const result = publicRegistrationSchema.safeParse({
      fullName: "Fulano da Silva",
      email: "fulano@exemplo.com",
      password: "password123",
      confirmPassword: "password124",
      cpf: "529.982.247-25",
      position: "Analista",
      companyName: "Empresa X",
      phones: ["(11) 99999-9999"],
      address: {
        zipCode: "01000-000",
        street: "Rua A",
        number: "10",
        complement: "",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe("As senhas não coincidem");
    }
  });

  it("accepts a valid payload", () => {
    const result = publicRegistrationSchema.safeParse({
      fullName: "Fulano da Silva",
      email: "fulano@exemplo.com",
      password: "password123",
      confirmPassword: "password123",
      cpf: "529.982.247-25",
      position: "Analista",
      companyName: "Empresa X",
      phones: ["(11) 99999-9999", "(11) 98888-8888"],
      address: {
        zipCode: "01000-000",
        street: "Rua A",
        number: "10",
        complement: "Apto 12",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      },
    });

    expect(result.success).toBe(true);
  });
});

