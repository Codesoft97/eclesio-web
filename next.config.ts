import type { NextConfig } from "next";

function normalizeBackendApiUrl(value: string | undefined) {
  const normalizedValue = value?.trim().replace(/\/+$/, "");

  if (!normalizedValue) {
    return undefined;
  }

  return normalizedValue.endsWith("/api")
    ? normalizedValue
    : `${normalizedValue}/api`;
}

const backendApiUrl = normalizeBackendApiUrl(
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
