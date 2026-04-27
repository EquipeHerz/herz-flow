import { z } from "zod";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const isValidCPF = (value: string) => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factorStart - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base9 = cpf.slice(0, 9);
  const d1 = calcDigit(base9, 10);
  const base10 = cpf.slice(0, 10);
  const d2 = calcDigit(base10, 11);

  return cpf === `${base9}${d1}${d2}`;
};

export const publicRegistrationSchema = z
  .object({
    fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirmação de senha obrigatória"),
    cpf: z.string().refine(isValidCPF, "CPF inválido"),
    position: z.string().min(2, "Cargo obrigatório"),
    companyName: z.string().min(2, "Empresa obrigatória"),
    phones: z
      .array(
        z
          .string()
          .min(1, "Telefone obrigatório")
          .refine((v) => {
            const digits = onlyDigits(v);
            return digits.length === 10 || digits.length === 11;
          }, "Telefone inválido")
      )
      .min(1, "Informe pelo menos um telefone"),
    address: z.object({
      zipCode: z
        .string()
        .min(1, "CEP obrigatório")
        .refine((v) => onlyDigits(v).length === 8, "CEP inválido"),
      street: z.string().min(3, "Rua obrigatória"),
      number: z.string().min(1, "Número obrigatório"),
      complement: z.string().optional(),
      neighborhood: z.string().min(2, "Bairro obrigatório"),
      city: z.string().min(2, "Cidade obrigatória"),
      state: z.string().length(2, "Estado deve ter 2 letras"),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type PublicRegistrationValues = z.infer<typeof publicRegistrationSchema>;

