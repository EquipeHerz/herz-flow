type RememberedCredentials = {
  login: string;
  password: string;
};

type StoredRememberedCredentialsV1 = {
  v: 1;
  login: string;
  cipherTextB64: string;
  ivB64: string;
  expiresAt: number;
};

const STORAGE_KEY = "herz_remembered_credentials";
const DEVICE_SECRET_KEY = "herz_device_secret_v1";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const fromBase64 = (b64: string) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

const getOrCreateDeviceSecret = () => {
  const existing = localStorage.getItem(DEVICE_SECRET_KEY);
  if (existing) return existing;
  const created = toBase64(randomBytes(32).buffer);
  localStorage.setItem(DEVICE_SECRET_KEY, created);
  return created;
};

const deriveKey = async (deviceSecretB64: string, login: string) => {
  const secretBytes = new Uint8Array(fromBase64(deviceSecretB64));
  const baseKey = await crypto.subtle.importKey("raw", secretBytes, "PBKDF2", false, ["deriveKey"]);
  const salt = textEncoder.encode(login.trim().toLowerCase());
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const clearRememberedCredentials = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveRememberedCredentials = async (data: RememberedCredentials, ttlDays = 30) => {
  const login = data.login.trim();
  if (!login) throw new Error("Login obrigatório.");
  if (!data.password) throw new Error("Senha obrigatória.");

  const deviceSecret = getOrCreateDeviceSecret();
  const key = await deriveKey(deviceSecret, login);

  const iv = randomBytes(12);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(data.password)
  );

  const payload: StoredRememberedCredentialsV1 = {
    v: 1,
    login,
    cipherTextB64: toBase64(cipher),
    ivB64: toBase64(iv.buffer),
    expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadRememberedCredentials = async (): Promise<RememberedCredentials | null> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let parsed: StoredRememberedCredentialsV1 | null = null;
  try {
    parsed = JSON.parse(raw) as StoredRememberedCredentialsV1;
  } catch {
    clearRememberedCredentials();
    return null;
  }

  if (!parsed || parsed.v !== 1) {
    clearRememberedCredentials();
    return null;
  }

  if (!parsed.login || !parsed.cipherTextB64 || !parsed.ivB64 || !parsed.expiresAt) {
    clearRememberedCredentials();
    return null;
  }

  if (Date.now() > parsed.expiresAt) {
    clearRememberedCredentials();
    return null;
  }

  try {
    const deviceSecret = getOrCreateDeviceSecret();
    const key = await deriveKey(deviceSecret, parsed.login);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(fromBase64(parsed.ivB64)) },
      key,
      fromBase64(parsed.cipherTextB64)
    );
    const password = textDecoder.decode(plain);
    return { login: parsed.login, password };
  } catch {
    clearRememberedCredentials();
    return null;
  }
};

