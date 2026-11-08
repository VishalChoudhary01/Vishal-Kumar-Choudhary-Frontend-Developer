const MIN_HMAC_SECRET_BYTES = 32;

export function getPortfolioAnalyticsConfig(env = process.env) {
  const enabled = env.PORTFOLIO_ANALYTICS_ENABLED === "true";

  if (!enabled) {
    return {
      enabled: false,
      hmacSecret: null,
    };
  }

  const hmacSecret =
    typeof env.PORTFOLIO_ANALYTICS_HMAC_SECRET === "string"
      ? env.PORTFOLIO_ANALYTICS_HMAC_SECRET
      : "";

  if (Buffer.byteLength(hmacSecret, "utf8") < MIN_HMAC_SECRET_BYTES) {
    const error = new Error(
      "Portfolio Analytics is enabled but PORTFOLIO_ANALYTICS_HMAC_SECRET is missing or too short.",
    );
    error.code = "PORTFOLIO_ANALYTICS_NOT_CONFIGURED";
    throw error;
  }

  return { enabled: true, hmacSecret };
}

/**
 * Production tracking is accepted only on the configured canonical host.
 * Vercel preview deployments are always rejected. Local tracking is opt-in.
 */
export function isPortfolioAnalyticsHostAllowed({ host, env = process.env } = {}) {
  if (typeof host !== "string" || !host.trim()) return false;

  const normalizedHost = host.trim().toLowerCase().replace(/:\d+$/, "");
  const configuredSiteUrl =
    typeof env.NEXT_PUBLIC_SITE_URL === "string"
      ? env.NEXT_PUBLIC_SITE_URL.trim()
      : "";

  let canonicalHost = "";
  try {
    canonicalHost = configuredSiteUrl ? new URL(configuredSiteUrl).hostname.toLowerCase() : "";
  } catch {
    return false;
  }

  if (env.VERCEL === "1") {
    return env.VERCEL_ENV === "production" &&
      Boolean(canonicalHost) &&
      normalizedHost === canonicalHost;
  }

  if (env.NODE_ENV === "production") {
    return Boolean(canonicalHost) && normalizedHost === canonicalHost;
  }

  if (env.PORTFOLIO_ANALYTICS_ALLOW_LOCAL !== "true") return false;

  return ["localhost", "127.0.0.1", "::1"].includes(normalizedHost);
}

export const PORTFOLIO_ANALYTICS_RETENTION_DAYS = 65;
export const PORTFOLIO_ANALYTICS_RETENTION_MS =
  PORTFOLIO_ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
