import type { TokenStore } from "@/services/http/tokenStore";
import { ApiError } from "@/services/http/apiError";
import type { LoginInput, LoginResult } from "./sistemaLoginBackApi";
import { SistemaLoginBackApi } from "./sistemaLoginBackApi";
import type { Usuario } from "./models";

export class SistemaLoginBackAuthService {
  constructor(
    private readonly api: SistemaLoginBackApi,
    private readonly tokenStore: TokenStore
  ) {}

  async login(input: LoginInput): Promise<Usuario> {
    try {
      const result: LoginResult = await this.api.login(input);
      this.tokenStore.setTokens({
        accessToken: result.jwt,
        refreshToken: result.refreshToken ?? null,
      });
      return result.user;
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao autenticar usuário.");
    }
  }

  logout(): void {
    this.tokenStore.clear();
  }

  async validateToken(): Promise<boolean> {
    try {
      return await this.api.isAuthenticated();
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao validar token.");
    }
  }

  getAccessToken(): string | null {
    return this.tokenStore.getTokens().accessToken;
  }
}

