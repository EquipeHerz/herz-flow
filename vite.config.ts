import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const rewriteSetCookieForHttpDev = (header: string) => {
  const parts = header.split(";").map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  let hasSameSite = false;
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower === "secure") continue;
    if (lower.startsWith("samesite=")) {
      out.push("SameSite=Lax");
      hasSameSite = true;
      continue;
    }
    out.push(part);
  }
  if (!hasSameSite) out.push("SameSite=Lax");
  return out.join("; ");
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/loginBack": {
        target: "http://72.60.142.80:9588",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/loginBack/, ""),
        configure: (proxy) => {
          if (mode !== "development") return;
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (!setCookie) return;
            if (Array.isArray(setCookie)) {
              proxyRes.headers["set-cookie"] = setCookie.map(rewriteSetCookieForHttpDev);
              return;
            }
            if (typeof setCookie === "string") {
              proxyRes.headers["set-cookie"] = rewriteSetCookieForHttpDev(setCookie);
            }
          });
        },
      },
      "/api/utilsBack": {
        target: "http://72.60.142.80:9589",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/utilsBack/, ""),
      },
      "/api": {
        target: "http://72.60.142.80:9588",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          if (mode !== "development") return;
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (!setCookie) return;
            if (Array.isArray(setCookie)) {
              proxyRes.headers["set-cookie"] = setCookie.map(rewriteSetCookieForHttpDev);
              return;
            }
            if (typeof setCookie === "string") {
              proxyRes.headers["set-cookie"] = rewriteSetCookieForHttpDev(setCookie);
            }
          });
        },
      },
      "/utilsapi": {
        target: "http://72.60.142.80:9589",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/utilsapi/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
