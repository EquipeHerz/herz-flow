import { z } from "zod";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const userRegistrationSchema = z
  .object({
    nome: z.string().min(3, "Nome obrigatório"),
    login: z.string().min(3, "Login deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    senhaNova: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmSenhaNova: z.string().min(8, "Confirmação de senha obrigatória"),
    cargo: z.string().min(2, "Cargo obrigatório"),
    departamento: z.string().optional(),
    aceiteLGPD: z.boolean().refine((v) => v === true, "Você deve aceitar a LGPD"),
    tipoUsuario: z.enum(["1", "2"]),
    telefones: z
      .array(
        z.object({
          ddi: z.string().min(1, "DDI obrigatório"),
          ddd: z.string().refine((v) => onlyDigits(v).length === 2, "DDD inválido"),
          numero: z.string().refine((v) => {
            const digits = onlyDigits(v);
            return digits.length === 8 || digits.length === 9;
          }, "Número inválido"),
          tipoTelefone: z.enum(["1", "2"]),
          observacoes: z.string().optional(),
        })
      )
      .min(1, "Informe ao menos um telefone"),
  })
  .refine((data) => data.senhaNova === data.confirmSenhaNova, {
    message: "As senhas não coincidem",
    path: ["confirmSenhaNova"],
  });

export type UserRegistrationValues = z.infer<typeof userRegistrationSchema>;
