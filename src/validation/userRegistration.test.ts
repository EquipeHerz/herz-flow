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
      enderecos: [
        {
          tipoLogradouro: 1,
          nomeLogradouro: "Rua A",
          numero: "10",
          complemento: "",
          bairro: "Centro",
          municipio: { id: 1, descricao: "Pelotas", estado: { id: 43, descricao: "Rio Grande do Sul", sigla: "RS" } },
          cep: "70297400",
          observacoes: "",
        },
      ],
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
      enderecos: [
        {
          tipoLogradouro: 1,
          nomeLogradouro: "Rua A",
          numero: "10",
          complemento: "",
          bairro: "Centro",
          municipio: { id: 1, descricao: "Pelotas", estado: { id: 43, descricao: "Rio Grande do Sul", sigla: "RS" } },
          cep: "70297400",
          observacoes: "",
        },
      ],
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
      enderecos: [
        {
          tipoLogradouro: 1,
          nomeLogradouro: "Rua A",
          numero: "10",
          complemento: "Sala 10",
          bairro: "Centro",
          municipio: { id: 1, descricao: "Pelotas", estado: { id: 43, descricao: "Rio Grande do Sul", sigla: "RS" } },
          cep: "70297400",
          observacoes: "Próximo ao shopping",
        },
        {
          tipoLogradouro: 2,
          nomeLogradouro: "Av B",
          numero: "200",
          complemento: "",
          bairro: "Bairro 2",
          municipio: { id: 2, descricao: "Porto Alegre", estado: { id: 43, descricao: "Rio Grande do Sul", sigla: "RS" } },
          cep: "90500000",
          observacoes: "",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
