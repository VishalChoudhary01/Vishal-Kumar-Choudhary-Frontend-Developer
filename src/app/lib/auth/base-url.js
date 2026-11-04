import "server-only";

function toOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    return new URL(value.trim()).origin;
  } catch {
    return "";
  }
}

function toPreviewOrigin(host) {
  if (typeof host !== "string" || !host.trim()) return "";
  const value = host.trim();
  const lowerValue = value.toLowerCase();
  const hasProtocol =
    lowerValue.startsWith("https://") || lowerValue.startsWith("http://");

  return toOrigin(hasProtocol ? value : `https://${value}`);
}

/**
 * Resolve the origin used for Better Auth links and callbacks.
 *
 * Preview deployments must not inherit NEXT_PUBLIC_SITE_URL, which points
 * to Production. Prefer Vercel's stable branch URL, then its deployment URL.
 * Production and local development retain the canonical site URL fallback.
 */
export function getAuthBaseURL(fallbackURL) {
  if (process.env.VERCEL_ENV === "preview") {
    const previewURL = toPreviewOrigin(
      process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL,
    );

    if (previewURL) return previewURL;

    const requestOrigin = toOrigin(fallbackURL);
    if (requestOrigin) return requestOrigin;
  }

  const explicitURL = toOrigin(process.env.BETTER_AUTH_URL);
  if (explicitURL) return explicitURL;

  const canonicalURL = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (canonicalURL) return canonicalURL;

  return toOrigin(fallbackURL) || "http://localhost:3000";
}
