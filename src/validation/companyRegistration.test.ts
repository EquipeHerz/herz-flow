import { describe, expect, it } from "vitest";
import { companyCheckSchema, companyRegistrationSchema, isValidCNPJ } from "./companyRegistration";

describe("companyRegistration", () => {
  it("validates CNPJ correctly", () => {
    expect(isValidCNPJ("34.432.780/0001-60")).toBe(true);
    expect(isValidCNPJ("00.000.000/0000-00")).toBe(false);
    expect(isValidCNPJ("11.111.111/1111-11")).toBe(false);
  });

  it("requires only CNPJ for check", () => {
    const result = companyCheckSchema.safeParse({ cnpj: "34.432.780/0001-60" });
    expect(result.success).toBe(true);
  });

  it("requires fields for full registration", () => {
    const result = companyRegistrationSchema.safeParse({
      cnpj: "34.432.780/0001-60",
      nomeOficial: "",
      nomeFantasia: "",
      webSite: "",
      experiencia: "",
      enderecos: [
        {
          tipoLogradouro: 1,
          nomeLogradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          municipio: { id: 1, descricao: "", estado: { id: 1, descricao: "", sigla: "" } },
          cep: "",
          observacoes: "",
        },
      ],
      responsavelLegalNome: "",
      responsavelLegalCPF: "",
      responsavelLegalRG: "",
      responsavelLegalCargo: "",
      responsavelLegalEmail: "invalido",
    });

    expect(result.success).toBe(false);
  });

  it("accepts website without protocol", () => {
    const base = {
      cnpj: "34.432.780/0001-60",
      nomeOficial: "Empresa Teste",
      nomeFantasia: "Empresa Teste",
      experiencia: "Experiência válida aqui",
      enderecos: [
        {
          tipoLogradouro: 1,
          nomeLogradouro: "Rua Teste",
          numero: "123",
          complemento: "",
          bairro: "Centro",
          municipio: { id: 1, descricao: "Cidade", estado: { id: 1, descricao: "Estado", sigla: "RS" } },
          cep: "96000000",
          observacoes: "",
        },
      ],
      responsavelLegalNome: "Fulano de Tal",
      responsavelLegalCPF: "12345678909",
      responsavelLegalRG: "1234567",
      responsavelLegalCargo: "Gerente",
      responsavelLegalEmail: "teste@empresa.com",
    };

    expect(companyRegistrationSchema.safeParse({ ...base, webSite: "www.empresa.com.br" }).success).toBe(true);
    expect(companyRegistrationSchema.safeParse({ ...base, webSite: "empresa.com.br" }).success).toBe(true);
    expect(companyRegistrationSchema.safeParse({ ...base, webSite: "https://empresa.com.br" }).success).toBe(true);
    expect(companyRegistrationSchema.safeParse({ ...base, webSite: "empresa" }).success).toBe(false);
  });
});
