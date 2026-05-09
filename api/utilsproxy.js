const readRequestBody = async (req) => {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return Buffer.from(req.body);
    if (typeof req.body === "object") return Buffer.from(JSON.stringify(req.body));
  }

  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
};

const toForwardHeaders = (headers) => {
  const out = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value == null) continue;
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length" || lower === "transfer-encoding") {
      continue;
    }
    out[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return out;
};

const getSetCookieHeaders = (upstreamHeaders) => {
  if (!upstreamHeaders) return [];
  const anyHeaders = upstreamHeaders;
  if (typeof anyHeaders.getSetCookie === "function") return anyHeaders.getSetCookie();
  const single = upstreamHeaders.get?.("set-cookie");
  return single ? [single] : [];
};

const applyCors = (req, res) => {
  const origin = typeof req.headers?.origin === "string" ? req.headers.origin : null;
  if (!origin) return;
  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("vary", "origin");
  res.setHeader("access-control-allow-credentials", "true");
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "Content-Type, Authorization");
};

const getRelativeFromRewrite = (req) => {
  const url = new URL(typeof req.url === "string" ? req.url : "", "http://localhost");
  const pathParam = url.searchParams.get("path") ?? "";
  url.searchParams.delete("path");
  const qs = url.searchParams.toString();

  const cleanPath = pathParam.replace(/^\/+/, "");
  const base = `/${cleanPath}`;
  return qs ? `${base}?${qs}` : base;
};

export default async function handler(req, res) {
  try {
    applyCors(req, res);
    if ((req.method ?? "GET").toUpperCase() === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const backendBase = process.env.SISTEMA_UTILS_BACK_URL || "http://72.60.142.80:9589";
    const relative = getRelativeFromRewrite(req);
    const targetUrl = `${backendBase}${relative.startsWith("/") ? relative : `/${relative}`}`;

    const body = await readRequestBody(req);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: toForwardHeaders(req.headers),
      body,
      redirect: "manual",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    res.statusCode = upstream.status;

    const setCookies = getSetCookieHeaders(upstream.headers);
    if (setCookies.length) res.setHeader("set-cookie", setCookies);

    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        message: "Falha ao encaminhar requisição para o backend utils.",
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
}

