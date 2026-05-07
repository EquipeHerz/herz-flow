import { z } from "zod";
import { isValidCPF } from "@/validation/publicRegistration";
import { onlyDigits } from "@/validation/userRegistration";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, schema.optional());

const enderecoSchema = z.object({
  id: z.string().optional(),
  tipoLogradouro: z.coerce.number().int().optional(),
  nomeLogradouro: z.string().min(2, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  municipio: z.object({
    id: z.coerce.number().int({ message: "Município obrigatório" }),
    descricao: z.string().min(2, "Município obrigatório"),
    estado: z.object({
      id: z.coerce.number().int({ message: "UF inválida" }),
      descricao: z.string().optional(),
      sigla: z.string().length(2, "UF deve ter 2 letras"),
    }),
  }),
  cep: z.string().refine((v) => onlyDigits(v).length === 8, "CEP inválido"),
  observacoes: z.string().optional(),
});

const strongPasswordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .refine((v) => /[A-Z]/.test(v), "Senha deve conter ao menos 1 letra maiúscula")
  .refine((v) => /[a-z]/.test(v), "Senha deve conter ao menos 1 letra minúscula")
  .refine((v) => /\d/.test(v), "Senha deve conter ao menos 1 número")
  .refine(
    (v) => /[!@#$%^&*()_\-+=\[\]{};:,.?/~|]/.test(v),
    "Senha deve conter ao menos 1 caractere especial válido"
  )
  .refine((v) => !/\s/.test(v), "Senha não pode conter espaços");

export const profileUpdateSchema = z
  .object({
    nome: z.string().min(3, "Nome obrigatório"),
    login: z.string().min(3, "Login deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().refine(isValidCPF, "CPF inválido"),
    dataNascimento: z
      .string()
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data de nascimento inválida"),
    cargo: z.string().min(2, "Cargo obrigatório"),
    departamento: z.string().optional(),
    aceiteLGPD: z.boolean().refine((v) => v === true, "Você deve aceitar a LGPD"),
    telefones: z
      .array(
        z.object({
          ddi: z.string().min(1, "DDI obrigatório"),
          ddd: z.string().refine((v) => onlyDigits(v).length === 2, "DDD inválido"),
          numero: z.string().refine((v) => {
            const digits = onlyDigits(v);
            return digits.length === 8 || digits.length === 9;
          }, "Número inválido"),
          tipoTelefone: z.string().min(1, "Tipo de telefone obrigatório"),
          observacoes: z.string().optional(),
        })
      )
      .min(1, "Informe ao menos um telefone"),
    enderecos: z.array(enderecoSchema),

    alterarSenha: z.boolean(),
    senhaConfirmacao: emptyToUndefined(z.string()),
    senhaAtual: emptyToUndefined(z.string().min(1, "Senha atual obrigatória")),
    senhaNova: emptyToUndefined(strongPasswordSchema),
    confirmSenhaNova: emptyToUndefined(z.string().min(8, "Confirmação de senha obrigatória")),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = data.alterarSenha === true;
    if (!wantsPasswordChange) return;

    if (!data.senhaAtual) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Senha atual obrigatória", path: ["senhaAtual"] });
    }
    if (!data.senhaNova) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nova senha obrigatória", path: ["senhaNova"] });
    }
    if (!data.confirmSenhaNova) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirmação de senha obrigatória",
        path: ["confirmSenhaNova"],
      });
    }
    if (data.senhaNova && data.confirmSenhaNova && data.senhaNova !== data.confirmSenhaNova) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As senhas não coincidem", path: ["confirmSenhaNova"] });
    }
  });

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
