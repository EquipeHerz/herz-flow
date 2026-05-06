import { z } from "zod";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const enderecoSchema = z.object({
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
    tipoUsuario: z.string().min(1, "Tipo de usuário obrigatório"),
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
    enderecos: z.array(enderecoSchema).min(1, "Informe ao menos um endereço"),
  })
  .refine((data) => data.senhaNova === data.confirmSenhaNova, {
    message: "As senhas não coincidem",
    path: ["confirmSenhaNova"],
  });

export type UserRegistrationValues = z.infer<typeof userRegistrationSchema>;
