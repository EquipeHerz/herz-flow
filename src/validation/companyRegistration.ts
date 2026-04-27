import { z } from "zod";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const isValidCNPJ = (value: string) => {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base12 = cnpj.slice(0, 12);
  const d1 = calcDigit(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const base13 = cnpj.slice(0, 13);
  const d2 = calcDigit(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj === `${base12}${d1}${d2}`;
};

export const companyCheckSchema = z.object({
  cnpj: z.string().refine(isValidCNPJ, "CNPJ inválido"),
});

export const companyRegistrationSchema = z.object({
  cnpj: z.string().refine(isValidCNPJ, "CNPJ inválido"),
  nomeOficial: z.string().min(2, "Nome oficial obrigatório"),
  nomeFantasia: z.string().min(2, "Nome fantasia obrigatório"),
  webSite: z.string().url("Website inválido").optional().or(z.literal("")),
  experiencia: z.string().min(10, "Descreva a experiência (mínimo 10 caracteres)").optional().or(z.literal("")),
  endereco: z.object({
    tipoLogradouro: z.coerce.number().int().optional(),
    nomeLogradouro: z.string().min(2, "Logradouro obrigatório"),
    numero: z.string().min(1, "Número obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(2, "Bairro obrigatório"),
    municipio: z.object({
      id: z.coerce.number().int().optional(),
      descricao: z.string().min(2, "Município obrigatório"),
      estado: z.object({
        id: z.coerce.number().int().optional(),
        descricao: z.string().optional(),
        sigla: z.string().length(2, "UF deve ter 2 letras"),
      }),
    }),
    cep: z.string().refine((v) => onlyDigits(v).length === 8, "CEP inválido"),
    observacoes: z.string().optional(),
  }),
  responsavelLegalNome: z.string().min(3, "Nome do responsável obrigatório"),
  responsavelLegalCPF: z.string().refine((v) => onlyDigits(v).length === 11, "CPF inválido"),
  responsavelLegalRG: z.string().optional(),
  responsavelLegalCargo: z.string().min(2, "Cargo do responsável obrigatório"),
  responsavelLegalEmail: z.string().email("E-mail do responsável inválido"),
});

export type CompanyCheckValues = z.infer<typeof companyCheckSchema>;
export type CompanyRegistrationValues = z.infer<typeof companyRegistrationSchema>;

