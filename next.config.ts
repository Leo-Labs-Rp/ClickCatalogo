import type { NextConfig } from "next";

function getSupabaseOrigins() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return { http: null, websocket: null };

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { http: null, websocket: null };
    }

    return {
      http: url.origin,
      websocket: `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}`,
    };
  } catch {
    return { http: null, websocket: null };
  }
}

function getSupabaseImagePattern() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return [];

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];

    return [{
      hostname: url.hostname,
      pathname: "/storage/v1/object/public/**",
      port: url.port,
      protocol: url.protocol === "http:" ? "http" as const : "https" as const,
    }];
  } catch {
    return [];
  }
}

function getContentSecurityPolicy() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const supabase = getSupabaseOrigins();
  const imageSources = ["'self'", "blob:", "data:", supabase.http].filter(Boolean).join(" ");
  const connectSources = ["'self'", supabase.http, supabase.websocket].filter(Boolean).join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources}`,
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: getContentSecurityPolicy() },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ headers: securityHeaders, source: "/:path*" }];
  },
  images: {
    remotePatterns: getSupabaseImagePattern(),
  },
};

export default nextConfig;
