import type { User } from "../types/auth";

const TOKEN_KEY = "herz_auth_token";
const REFRESH_KEY = "herz_refresh_token";
const USER_KEY = "herz_user_data";

const safeJsonParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const authService = {
  getToken(): string | null {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw?.trim() ? raw.trim() : null;
  },

  getRefreshToken(): string | null {
    const raw = localStorage.getItem(REFRESH_KEY);
    return raw?.trim() ? raw.trim() : null;
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw?.trim()) return null;
    return safeJsonParse<User>(raw);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  logout(): void {
    authService.clearSession();
  },
};
