const FALLBACK_SITE_ORIGIN = "https://qunt-edge.vercel.app";
const LOCAL_SITE_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return FALLBACK_SITE_ORIGIN;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteOrigin(): string {
  const previewUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "preview") {
    return previewUrl ? normalizeOrigin(previewUrl) : FALLBACK_SITE_ORIGIN;
  }

  if (siteUrl) {
    return normalizeOrigin(siteUrl);
  }

  if (vercelEnv === "production" && previewUrl) {
    return normalizeOrigin(previewUrl);
  }

  if (previewUrl) {
    return normalizeOrigin(previewUrl);
  }

  return process.env.NODE_ENV === "development"
    ? LOCAL_SITE_ORIGIN
    : FALLBACK_SITE_ORIGIN;
}

export function getSiteUrl(path = "/"): string {
  const origin = getSiteOrigin();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return normalizedPath === "/" ? origin : `${origin}${normalizedPath}`;
}
