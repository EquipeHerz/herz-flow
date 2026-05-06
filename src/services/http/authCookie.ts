const normalizeBearerToken = (value: string) => value.trim().replace(/^bearer\s+/i, "");

const parseCookieHeader = (cookieHeader: string) => {
  const out: Record<string, string> = {};
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1);
    if (!k) continue;
    out[k] = v;
  }
  return out;
};

const defaultCookieNames = () => {
  const envName = (import.meta as any)?.env?.VITE_AUTH_COOKIE_NAME;
  const first = typeof envName === "string" && envName.trim() ? [envName.trim()] : [];
  return [
    ...first,
    "authToken",
    "AuthToken",
    "accessToken",
    "access_token",
    "token",
    "jwt",
    "herz_auth_token",
  ];
};

export const getAuthTokenFromCookies = (cookieNames?: string[]) => {
  if (typeof document === "undefined") return null;
  const cookies = parseCookieHeader(document.cookie ?? "");
  const names = cookieNames?.length ? cookieNames : defaultCookieNames();
  for (const name of names) {
    const raw = cookies[name];
    if (typeof raw === "string" && raw.trim()) return normalizeBearerToken(raw);
  }
  return null;
};

