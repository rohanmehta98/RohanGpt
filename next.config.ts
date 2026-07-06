import path from "path";
import type { NextConfig } from "next";

// Security headers applied to every response.
// frame-ancestors 'none' + X-Frame-Options block clickjacking; the rest are
// safe, widely-recommended hardening. A full script-src CSP is intentionally
// omitted (Next.js + Framer Motion need inline styles/scripts and it would
// require nonces to avoid breaking the app).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Ensure the RAG source docs (read via fs at runtime, and intentionally kept
  // out of public/) get bundled into the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/chat": ["./src/content/docs/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
