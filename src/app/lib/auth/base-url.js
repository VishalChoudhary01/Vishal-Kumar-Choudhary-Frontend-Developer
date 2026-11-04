import "server-only";

const PROJECT_HOST = "vishal-kumar-choudhary-frontend-developer.vercel.app";
const PROJECT_PREVIEW_HOST = /^vishal-kumar-choudhary-frontend-developer-[a-z0-9-]+\\.vercel\\.app$/i;
const PROJECT_BRANCH_ALIAS_HOST =
  /^vishal-kumar-choudh-git-[a-z0-9-]+-vishal-kumar-choudharys-projects\\.vercel\\.app$/i;

function toOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    return new URL(value.trim()).origin;
  } catch {
    return "";
  }
}

function toProjectOrigin(value) {
  const origin = toOrigin(value);
  if (!origin) return "";

  const hostname = new URL(origin).hostname.toLowerCase();

  if (hostname === PROJECT_HOST || PROJECT_PREVIEW_HOST.test(hostname) || PROJECT_BRANCH_ALIAS_HOST.test(hostname)) {
    return origin;
  }

  return "";
}

function toPreviewOrigin(host) {
  if (typeof host !== "string" || !host.trim()) return "";
  const value = host.trim();
  const lowerValue = value.toLowerCase();
  const hasProtocol =
    lowerValue.startsWith("https://") || lowerValue.startsWith("http://");

  return toProjectOrigin(hasProtocol ? value : `https://${value}`);
}

/**
 * Production auth callbacks use the canonical site origin.
 * Preview callbacks stay on the exact Vercel deployment that received the
 * registration/resend request. Both are restricted to this Vercel project.
 */
export function getCanonicalAuthBaseURL() {
  const explicitURL = toOrigin(process.env.BETTER_AUTH_URL);
  if (explicitURL) return explicitURL;

  const canonicalURL = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (canonicalURL) return canonicalURL;

  return "https://" + PROJECT_HOST;
}

export function getAuthBaseURL(fallbackURL) {
  if (process.env.VERCEL_ENV === "preview") {
    const requestOrigin = toProjectOrigin(fallbackURL);
    if (requestOrigin) return requestOrigin;

    const previewOrigin = toPreviewOrigin(
      process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL,
    );
    if (previewOrigin) return previewOrigin;
  }

  return getCanonicalAuthBaseURL() || toOrigin(fallbackURL) || "http://localhost:3000";
}

export function getAuthBaseURLConfig() {
  if (process.env.VERCEL_ENV !== "preview") {
    return getCanonicalAuthBaseURL();
  }

  return {
    allowedHosts: [
      PROJECT_HOST,
      "vishal-kumar-choudhary-frontend-developer-*.vercel.app",
      "vishal-kumar-choudh-git-*-vishal-kumar-choudharys-projects.vercel.app",
    ],
    protocol: "https",
    fallback: getCanonicalAuthBaseURL(),
  };
}
