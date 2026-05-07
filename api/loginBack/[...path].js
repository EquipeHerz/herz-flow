const readRequestBody = async (req) => {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

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
    if (lower === "host" || lower === "connection") continue;
    out[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return out;
};

export default async function handler(req, res) {
  try {
    const backendBase = process.env.SISTEMA_LOGIN_BACK_URL || "http://72.60.142.80:9588";
    const url = typeof req.url === "string" ? req.url : "";
    const prefix = "/api/loginBack";
    const relative = url.startsWith(prefix) ? url.slice(prefix.length) : url;
    const targetUrl = `${backendBase}${relative.startsWith("/") ? relative : `/${relative}`}`;

    const body = await readRequestBody(req);

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: toForwardHeaders(req.headers),
      body,
      redirect: "manual",
    });

    res.statusCode = upstream.status;

    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) res.setHeader("set-cookie", setCookie);

    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ message: "Falha ao encaminhar requisição para o backend de login." }));
  }
}
