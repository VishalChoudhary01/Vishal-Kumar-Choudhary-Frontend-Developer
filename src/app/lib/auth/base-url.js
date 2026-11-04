import "server-only";

function toOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    return new URL(value.trim()).origin;
  } catch {
    return "";
  }
}

/**
 * Resolve the origin used for Better Auth links and callbacks.
 *
 * Preview deployments must not inherit NEXT_PUBLIC_SITE_URL, which points
 * to Production. Prefer Vercel's stable branch URL, then its deployment URL.
 * Production and local development retain the canonical site URL fallback.
 */
export function getAuthBaseURL(fallbackURL) {
  const explicitURL = toOrigin(process.env.BETTER_AUTH_URL);
  if (explicitURL) return explicitURL;

  if (process.env.VERCEL_ENV === "preview") {
    const previewHost =
      process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL || "";
    const previewURL = toOrigin(
      previewHost ? `https://${previewHost}` : "",
    );

    if (previewURL) return previewURL;
  }

  const canonicalURL = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (canonicalURL) return canonicalURL;

  return toOrigin(fallbackURL) || "http://localhost:3000";
}
