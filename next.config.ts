import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the brand logo PNG is bundled into serverless functions so the
  // email layer (src/lib/email.ts) can read it from disk and embed it as a
  // CID attachment. Without this, public/ assets aren't traced into the
  // function and the read would fail in production (e.g. Vercel).
  outputFileTracingIncludes: {
    "/**": ["./public/logo/logo2.png"],
  },
};

export default nextConfig;
