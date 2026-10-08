/*
 * URL UTILITY LAYER — one source for every absolute URL that leaves the
 * app (canonical, Open Graph, Twitter/X, JSON-LD, sitemap, robots).
 *
 * Spec §11 / §30:
 *   - NEXT_PUBLIC_SITE_URL is the production domain.
 *   - Production must NEVER emit localhost or example.com.
 *   - Development may use http://localhost:3000.
 */

const PRODUCTION_SITE_URL =
  "https://vishal-kumar-choudhary-frontend-developer.vercel.app";

function normalizeBase(raw) {
  let base = raw.trim().replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  return base;
}

/**
 * Absolute site origin WITHOUT a trailing slash, e.g.
 * "https://example.com".
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL (owner-supplied production domain)
 *   2. production build fallback (never localhost, never example.com)
 *   3. development fallback (localhost, allowed only in dev)
 */
export function buildSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;

  if (raw && raw.trim() !== "") {
    return normalizeBase(raw);
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return "http://localhost:3000";
}

/** Canonical project URL: SITE_URL/projects/[slug] */
export function buildProjectUrl(slug) {
  return `${buildSiteUrl()}/projects/${slug}`;
}

/**
 * Resolve a root-relative asset path to an absolute URL.
 * Returns null for empty input so callers can skip optional images.
 */
export function buildAbsoluteAssetUrl(path) {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return null;
  }

  return new URL(path, `${buildSiteUrl()}/`).href;
}
