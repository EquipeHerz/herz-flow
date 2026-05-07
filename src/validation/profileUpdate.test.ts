import { describe, expect, it } from "vitest";
import { profileUpdateSchema } from "./profileUpdate";

const basePayload = {
  nome: "Bianca Taino Ometo",
  login: "bianca123",
  email: "bianca@gmail.com",
  cpf: "891.274.963-33",
  dataNascimento: "1996-05-04",
  cargo: "Administrador do Sistema",
  departamento: "Development",
  aceiteLGPD: true,
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
  alterarSenha: false,
  senhaConfirmacao: "",
};

describe("profileUpdate", () => {
  it("accepts payload without password change", () => {
    const result = profileUpdateSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("accepts empty enderecos", () => {
    const result = profileUpdateSchema.safeParse({ ...basePayload, enderecos: [] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid CPF", () => {
    const result = profileUpdateSchema.safeParse({ ...basePayload, cpf: "111.111.111-11" });
    expect(result.success).toBe(false);
  });

  it("rejects partial password change", () => {
    const result = profileUpdateSchema.safeParse({ ...basePayload, alterarSenha: true, senhaNova: "BlaBleBli@1234!" });
    expect(result.success).toBe(false);
  });

  it("rejects password mismatch", () => {
    const result = profileUpdateSchema.safeParse({
      ...basePayload,
      alterarSenha: true,
      senhaAtual: "SenhaAntiga@123",
      senhaNova: "BlaBleBli@1234!",
      confirmSenhaNova: "BlaBleBli@9999!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts password change when all fields are present", () => {
    const result = profileUpdateSchema.safeParse({
      ...basePayload,
      alterarSenha: true,
      senhaAtual: "SenhaAntiga@123",
      senhaNova: "BlaBleBli@1234!",
      confirmSenhaNova: "BlaBleBli@1234!",
    });
    expect(result.success).toBe(true);
  });
});
