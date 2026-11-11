import { createHmac } from "node:crypto";

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
    user?.emailVerified !== true ||
    typeof user?.id !== "string" ||
    !user.id.trim() ||
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    return null;
  }

  const maskedEmail = maskPortfolioVisitEmail(user.email);
  if (!maskedEmail) return null;

  const name = normalizeDisplayName(user.name);
  const verifiedUserHash = createHmac("sha256", secret)
    .update("portfolio-analytics:verified-user:v1")
    .update("\0")
    .update(user.id.trim())
    .digest("hex");

  return {
    verifiedUserHash,
    verifiedUserName: name || "Verified account",
    verifiedUserEmailMasked: maskedEmail,
  };
}
