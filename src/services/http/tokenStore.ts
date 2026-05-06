export type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export interface TokenStore {
  getTokens(): Tokens;
  setTokens(tokens: Partial<Tokens>): void;
  clear(): void;
}

export class MemoryTokenStore implements TokenStore {
  private tokens: Tokens = { accessToken: null, refreshToken: null };

  getTokens(): Tokens {
    return { ...this.tokens };
  }

  setTokens(tokens: Partial<Tokens>): void {
    this.tokens = { ...this.tokens, ...tokens };
  }

  clear(): void {
    this.tokens = { accessToken: null, refreshToken: null };
  }
}

export class LocalStorageTokenStore implements TokenStore {
  constructor(
    private readonly accessTokenKey: string,
    private readonly refreshTokenKey: string
  ) {}

  getTokens(): Tokens {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    };
  }

  setTokens(tokens: Partial<Tokens>): void {
    if (tokens.accessToken !== undefined) {
      if (tokens.accessToken) localStorage.setItem(this.accessTokenKey, tokens.accessToken);
      else localStorage.removeItem(this.accessTokenKey);
    }

    if (tokens.refreshToken !== undefined) {
      if (tokens.refreshToken) localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
      else localStorage.removeItem(this.refreshTokenKey);
    }
  }

  clear(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}

