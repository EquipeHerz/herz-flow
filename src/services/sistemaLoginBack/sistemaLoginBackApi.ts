import type { AxiosInstance } from "axios";
import { z } from "zod";
import { ApiError } from "@/services/http/apiError";
import {
  adminEmpresaDTOSchema,
  empresaModelSchema,
  recuperaSenhaModelSchema,
  retornoPadraoSchema,
  usuarioSchema,
  type AdminEmpresaDTO,
  type EmpresaModel,
  type RecuperaSenhaModel,
  type RetornoPadrao,
  type Usuario,
} from "./models";

export type LoginInput = {
  login: string;
  password: string;
};

export type LoginResult = {
  user: Usuario;
  jwt: string;
  refreshToken?: string;
};

const loginInputSchema = z.object({
  login: z.string().min(1, "Login obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
});

const asString = (value: unknown) => (typeof value === "string" ? value : null);

const normalizeBearerToken = (value: string) => value.trim().replace(/^bearer\s+/i, "");

const extractTokenFromResponse = (data: unknown, headers: Record<string, unknown>) => {
  const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const fromBody =
    asString(obj?.authToken) ?? asString(obj?.token) ?? asString(obj?.jwt) ?? asString(obj?.accessToken);
  if (fromBody) return normalizeBearerToken(fromBody);

  const headerKeys = Object.keys(headers);
  const authHeaderKey = headerKeys.find((k) => k.toLowerCase() === "authorization");
  const authHeader = authHeaderKey ? asString(headers[authHeaderKey]) : null;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const xTokenKey = headerKeys.find((k) => k.toLowerCase() === "x-auth-token");
  const xToken = xTokenKey ? asString(headers[xTokenKey]) : null;
  return xToken ? normalizeBearerToken(xToken) : null;
};

export class SistemaLoginBackApi {
  constructor(private readonly http: AxiosInstance) {}

  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const parsed = loginInputSchema.parse(input);
      const body = {
        login: parsed.login,
        senhaAtual: parsed.password,
      };

      const response = await this.http.post("/login", body, {
        skipAuth: true,
        headers: { "Content-Type": "application/json" },
      });
      const user = usuarioSchema.safeParse(response.data);
      const jwt = extractTokenFromResponse(response.data, response.headers ?? {});

      if (!user.success) {
        return { user: {}, jwt: jwt ?? "" };
      }

      const refreshToken =
        typeof (user.data as Record<string, unknown>).refreshToken === "string"
          ? ((user.data as Record<string, unknown>).refreshToken as string)
          : undefined;

      return { user: user.data, jwt: jwt ?? user.data.authToken ?? "", refreshToken };
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao realizar login.");
    }
  }

  async getUserById(userId: string): Promise<Usuario | null> {
    try {
      const response = await this.http.get(`/login/${userId}`);
      const parsed = usuarioSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar usuário.");
    }
  }

  async unblockUser(userId: string): Promise<void> {
    try {
      await this.http.post(`/login/${userId}/unblock`, undefined);
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao desbloquear usuário.");
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.http.get("/autenticado");
      return true;
    } catch (err) {
      const apiError = ApiError.fromUnknown(err);
      if (apiError.kind === "http" && (apiError.status === 401 || apiError.status === 403)) return false;
      throw ApiError.fromUnknown(err, "Falha ao validar autenticação.");
    }
  }

  async loginExists(loginOrEmailOrCpf: string): Promise<boolean> {
    try {
      const value = z.string().min(1, "Valor obrigatório").parse(loginOrEmailOrCpf);
      const response = await this.http.post("/login/exists", value, { skipAuth: true });
      if (typeof response.data === "boolean") return response.data;
      if (typeof response.data === "string") return response.data.toLowerCase() === "true";
      return true;
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao verificar existência de login.");
    }
  }

  async requestPasswordRecovery(payload: RecuperaSenhaModel): Promise<void> {
    try {
      const parsed = recuperaSenhaModelSchema.parse(payload);
      await this.http.post("/login/recover", parsed, { skipAuth: true });
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao solicitar recuperação de senha.");
    }
  }

  async updatePasswordRecovery(payload: RecuperaSenhaModel): Promise<void> {
    try {
      const parsed = recuperaSenhaModelSchema.parse(payload);
      await this.http.put("/login/recover", parsed, { skipAuth: true });
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao atualizar recuperação de senha.");
    }
  }

  async getRecoveryByHash(hash: string): Promise<RecuperaSenhaModel | null> {
    try {
      const parsedHash = z.string().min(1).parse(hash);
      const response = await this.http.get(`/login/recover/${parsedHash}`, { skipAuth: true });
      const parsed = recuperaSenhaModelSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar recuperação de senha.");
    }
  }

  async createEmpresa(payload: EmpresaModel): Promise<void> {
    try {
      const parsed = empresaModelSchema.parse(payload);
      await this.http.put("/cadastro/empresa", parsed, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao cadastrar empresa.");
    }
  }

  async updateEmpresa(payload: EmpresaModel): Promise<void> {
    try {
      const parsed = empresaModelSchema.parse(payload);
      await this.http.put("/cadastro/empresa", parsed);
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao atualizar empresa.");
    }
  }

  async linkEmpresaUsuario(payload: EmpresaModel): Promise<void> {
    try {
      const parsed = empresaModelSchema.parse(payload);
      await this.http.put("/cadastro/empresa/usuario", parsed);
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao vincular usuário à empresa.");
    }
  }

  async upsertAdminEmpresa(payload: AdminEmpresaDTO): Promise<RetornoPadrao> {
    try {
      const parsed = adminEmpresaDTOSchema.parse(payload);
      const apiPayload = {
        usuario: parsed.usuario,
        cnpj: parsed.cnpj,
      };
      const response = await this.http.post("/cadastro/adminempresa", apiPayload, {
        headers: { "Content-Type": "application/json" },
      });
      const retorno = retornoPadraoSchema.safeParse(response.data);
      return retorno.success ? retorno.data : { result: true };
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao cadastrar administrador da empresa.");
    }
  }

  async searchEmpresa(): Promise<EmpresaModel | null> {
    try {
      const response = await this.http.get("/busca/empresa");
      const parsed = empresaModelSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      const apiError = ApiError.fromUnknown(err);
      if (apiError.kind === "http" && apiError.status === 400) return null;
      throw ApiError.fromUnknown(err, "Falha ao buscar empresa.");
    }
  }

  async searchEmpresaById(empresaId: string): Promise<EmpresaModel | null> {
    try {
      const parsedId = z.string().uuid().parse(empresaId);
      const response = await this.http.get(`/busca/empresa/id/${parsedId}`);
      const parsed = empresaModelSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      const apiError = ApiError.fromUnknown(err);
      if (apiError.kind === "http" && apiError.status === 400) return null;
      throw ApiError.fromUnknown(err, "Falha ao buscar empresa por ID.");
    }
  }

  async searchEmpresaByCnpj(cnpj: string): Promise<EmpresaModel | null> {
    try {
      const parsedCnpj = z.string().min(1).parse(cnpj);
      const response = await this.http.get(`/busca/empresa/cnpj/${parsedCnpj}`);
      const parsed = empresaModelSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      const apiError = ApiError.fromUnknown(err);
      if (apiError.kind === "http" && (apiError.status === 400 || apiError.status === 404)) return null;
      throw ApiError.fromUnknown(err, "Falha ao buscar empresa por CNPJ.");
    }
  }

  async searchEmpresaByCpf(cpf: string): Promise<EmpresaModel | null> {
    try {
      const parsedCpf = z.string().min(1).parse(cpf);
      const response = await this.http.get(`/busca/empresa/usuario/${parsedCpf}`);
      const parsed = empresaModelSchema.safeParse(response.data);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      const apiError = ApiError.fromUnknown(err);
      if (apiError.kind === "http" && apiError.status === 400) return null;
      throw ApiError.fromUnknown(err, "Falha ao buscar empresa por CPF.");
    }
  }
}
