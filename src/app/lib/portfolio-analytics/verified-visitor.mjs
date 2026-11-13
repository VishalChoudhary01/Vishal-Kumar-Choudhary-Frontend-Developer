import { createHmac } from "node:crypto";

export const PORTFOLIO_ANALYTICS_EXCLUDED_OWNER_EMAIL = "vishal.bhumca21@gmail.com";

export function isPortfolioAnalyticsExcludedOwner(user) {
  return typeof user?.email === "string" &&
    user.email.trim().toLowerCase() === PORTFOLIO_ANALYTICS_EXCLUDED_OWNER_EMAIL;
}

function createVerifiedUserHash(userId, secret) {
  return createHmac("sha256", secret)
    .update("portfolio-analytics:verified-user:v1")
    .update("\0")
    .update(userId)
    .digest("hex");
}

/**
 * Returns the owner's existing verified-visitor HMAC so historical rows can
 * be excluded without querying or storing the owner's email in analytics.
 * Fails closed when the owner session exists but its exclusion key is absent.
 */
export function getPortfolioAnalyticsExcludedOwnerHash({ user, secret } = {}) {
  if (!isPortfolioAnalyticsExcludedOwner(user)) return null;

  if (
    typeof user?.id !== "string" ||
    !user.id.trim() ||
    user.id.trim().length > 128 ||
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    const error = new Error("Portfolio Analytics owner exclusion is not configured.");
    error.code = "PORTFOLIO_ANALYTICS_OWNER_EXCLUSION_NOT_CONFIGURED";
    throw error;
  }

  return createVerifiedUserHash(user.id.trim(), secret);
}


function normalizeDisplayName(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function maskPortfolioVisitEmail(value) {
  if (typeof value !== "string" || value.length > 254) return null;
  const email = value.trim().toLowerCase();
  const separator = email.lastIndexOf("@");
  if (separator < 1 || separator === email.length - 1) return null;

  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  if (
    !/^[^@\s<>]+$/.test(local) ||
    !/^[a-z0-9.-]+$/i.test(domain) ||
    !domain.includes(".") ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return null;
  }

  return local[0] + "***@" + domain;
}

/**
 * Builds the only account fields permitted in a PortfolioVisit document.
 * Identity is derived exclusively from the server-validated Better Auth user.
 */
export function buildPortfolioVerifiedVisitor({ user, secret } = {}) {
  if (
    isPortfolioAnalyticsExcludedOwner(user) ||
    user?.emailVerified !== true ||
    typeof user?.id !== "string" ||
    !user.id.trim() ||
    user.id.trim().length > 128 ||
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    return null;
  }

  const maskedEmail = maskPortfolioVisitEmail(user.email);
  if (!maskedEmail) return null;

  const name = normalizeDisplayName(user.name);
  const verifiedUserHash = createVerifiedUserHash(user.id.trim(), secret);

  return {
    verifiedUserHash,
    verifiedUserAccountId: user.id.trim(),
    verifiedUserName: name || "Verified account",
    verifiedUserEmailMasked: maskedEmail,
  };
}
