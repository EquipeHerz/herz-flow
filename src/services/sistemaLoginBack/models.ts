import { z } from "zod";

export type TipoUsuarioEnum = 1 | 2 | 3 | 4;
export type TipoTelefone = 0 | 1 | 2 | 3 | 4;

export type TelefoneModel = {
  ddi?: string | null;
  ddd?: string | null;
  numero?: string | null;
  tipoTelefone?: TipoTelefone;
  observacoes?: string | null;
};

export type MunicipioModel = {
  id?: string | number;
  nome?: string | null;
  descricao?: string | null;
  estado?: EstadoModel;
};

export type EstadoModel = {
  id?: string | number;
  sigla?: string | null;
  nome?: string | null;
  descricao?: string | null;
};

export type EnderecoModel = {
  id?: string;
  tipoLogradouro?: number;
  nomeLogradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  municipio?: MunicipioModel;
  cep?: string | null;
  observacoes?: string | null;
};

export type Usuario = {
  id?: string;
  nome?: string | null;
  login?: string | null;
  senhaAtual?: string | null;
  senhaNova?: string | null;
  email?: string | null;
  dataNascimento?: string | null;
  cpf?: string | null;
  bio?: string | null;
  autenticado?: boolean;
  authToken?: string | null;
  mensagem?: string | null;
  senhaExpirada?: boolean;
  sessaoRegistrada?: boolean;
  cargo?: string | null;
  departamento?: string | null;
  aceiteLGPD?: boolean;
  tipoUsuario?: TipoUsuarioEnum;
  telefones?: TelefoneModel[];
  enderecos?: EnderecoModel[];
  dataCadastro?: string | null;
  dataAlteracaoSenha?: string | null;
};

export type EmpresaModel = {
  id?: string;
  nomeOficial?: string | null;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  usuarioID?: string | null;
  webSite?: string | null;
  experiencia?: string | null;
  endereco?: EnderecoModel;
  responsavelLegalNome?: string | null;
  responsavelLegalCPF?: string | null;
  responsavelLegalRG?: string | null;
  responsavelLegalCargo?: string | null;
  responsavelLegalEmail?: string | null;
  dataCadastro?: string | null;
};

export type AdminEmpresaDTO = {
  usuario: Usuario;
  cnpj: string;
};

export type RecuperaSenhaModel = {
  id?: string | null;
  login?: string | null;
  url?: string | null;
  user?: Usuario;
  dataSolicitacao?: string | null;
  mensagens?: string | null;
  status?: boolean;
};

export type RetornoPadrao = {
  result?: boolean;
  message?: string | null;
  idCriadoGuid?: string | null;
  idCriadoInt?: number | null;
  qtdeRegistros?: number | null;
};

const nullableString = z.string().nullable().optional();

export const telefoneModelSchema = z
  .object({
    ddi: nullableString,
    ddd: nullableString,
    numero: nullableString,
    tipoTelefone: z.number().optional(),
    observacoes: nullableString,
  })
  .passthrough();

export const estadoModelSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    sigla: nullableString,
    nome: nullableString,
    descricao: nullableString,
  })
  .passthrough();

export const municipioModelSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    nome: nullableString,
    descricao: nullableString,
    estado: estadoModelSchema.optional(),
  })
  .passthrough();

export const enderecoModelSchema = z
  .object({
    id: z.string().optional(),
    tipoLogradouro: z.number().optional(),
    nomeLogradouro: nullableString,
    numero: nullableString,
    complemento: nullableString,
    bairro: nullableString,
    municipio: municipioModelSchema.optional(),
    cep: nullableString,
    observacoes: nullableString,
  })
  .passthrough();

export const usuarioSchema = z
  .object({
    id: z.string().optional(),
    nome: nullableString,
    login: nullableString,
    senhaAtual: nullableString,
    senhaNova: nullableString,
    email: nullableString,
    dataNascimento: nullableString,
    cpf: nullableString,
    bio: nullableString,
    autenticado: z.boolean().optional(),
    authToken: nullableString,
    mensagem: nullableString,
    senhaExpirada: z.boolean().optional(),
    sessaoRegistrada: z.boolean().optional(),
    cargo: nullableString,
    departamento: nullableString,
    aceiteLGPD: z.boolean().optional(),
    tipoUsuario: z.number().optional(),
    telefones: z.array(telefoneModelSchema).optional(),
    enderecos: z.array(enderecoModelSchema).optional(),
    dataCadastro: nullableString,
    dataAlteracaoSenha: nullableString,
  })
  .passthrough();

export const empresaModelSchema = z
  .object({
    id: z.string().optional(),
    nomeOficial: nullableString,
    nomeFantasia: nullableString,
    cnpj: nullableString,
    usuarioID: nullableString,
    webSite: nullableString,
    experiencia: nullableString,
    endereco: enderecoModelSchema.optional(),
    responsavelLegalNome: nullableString,
    responsavelLegalCPF: nullableString,
    responsavelLegalRG: nullableString,
    responsavelLegalCargo: nullableString,
    responsavelLegalEmail: nullableString,
    dataCadastro: nullableString,
  })
  .passthrough();

export const adminEmpresaDTOSchema = z
  .object({
    usuario: usuarioSchema,
    cnpj: z.string(),
  })
  .passthrough();

export const recuperaSenhaModelSchema = z
  .object({
    id: nullableString,
    login: nullableString,
    url: nullableString,
    user: usuarioSchema.optional(),
    dataSolicitacao: nullableString,
    mensagens: nullableString,
    status: z.boolean().optional(),
  })
  .passthrough();

export const retornoPadraoSchema = z
  .object({
    result: z.boolean().optional(),
    message: nullableString,
    idCriadoGuid: nullableString,
    idCriadoInt: z.number().nullable().optional(),
    qtdeRegistros: z.number().nullable().optional(),
  })
  .passthrough();
