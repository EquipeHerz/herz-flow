import { describe, expect, it } from "vitest";
import { userRegistrationSchema } from "./userRegistration";

describe("userRegistration", () => {
  it("rejects password mismatch", () => {
    const result = userRegistrationSchema.safeParse({
      nome: "Bianca Taino Ometo",
      login: "bianca123",
      email: "bianca@gmail.com",
      senhaNova: "BlaBleBli@1234!",
      confirmSenhaNova: "BlaBleBli@9999!",
      cargo: "Administrador do Sistema",
      departamento: "Development",
      aceiteLGPD: true,
      tipoUsuario: "1",
      telefones: [{ ddi: "55", ddd: "11", numero: "991234567", tipoTelefone: "1", observacoes: "" }],
    });

    expect(result.success).toBe(false);
  });

  it("requires LGPD acceptance", () => {
    const result = userRegistrationSchema.safeParse({
      nome: "Bianca Taino Ometo",
      login: "bianca123",
      email: "bianca@gmail.com",
      senhaNova: "BlaBleBli@1234!",
      confirmSenhaNova: "BlaBleBli@1234!",
      cargo: "Administrador do Sistema",
      departamento: "Development",
      aceiteLGPD: false,
      tipoUsuario: "1",
      telefones: [{ ddi: "55", ddd: "11", numero: "991234567", tipoTelefone: "1", observacoes: "" }],
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid payload", () => {
    const result = userRegistrationSchema.safeParse({
      nome: "Bianca Taino Ometo",
      login: "bianca123",
      email: "bianca@gmail.com",
      senhaNova: "BlaBleBli@1234!",
      confirmSenhaNova: "BlaBleBli@1234!",
      cargo: "Administrador do Sistema",
      departamento: "Development",
      aceiteLGPD: true,
      tipoUsuario: "1",
      telefones: [
        { ddi: "55", ddd: "11", numero: "991234567", tipoTelefone: "1", observacoes: "WhatsApp pessoal" },
        { ddi: "55", ddd: "11", numero: "33445566", tipoTelefone: "2", observacoes: "Contato comercial" },
      ],
    });

    expect(result.success).toBe(true);
  });
});

