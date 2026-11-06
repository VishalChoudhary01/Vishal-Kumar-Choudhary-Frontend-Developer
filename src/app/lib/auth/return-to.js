const DEFAULT_RETURN_TO = "/labs";

const AUTH_ROUTES = new Set([
  "/labs/login",
  "/labs/signup",
  "/labs/forgot-password",
  "/labs/reset-password",
  "/labs/verify-email",
]);

export function getSafeReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return DEFAULT_RETURN_TO;
  }

  try {
    const parsed = new URL(value, "https://portfolio.invalid");

    if (
      parsed.origin !== "https://portfolio.invalid" ||
      !(parsed.pathname === "/labs" || parsed.pathname.startsWith("/labs/")) ||
      AUTH_ROUTES.has(parsed.pathname)
    ) {
      return DEFAULT_RETURN_TO;
    }

    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

export function getAbsoluteInternalUrl(path, origin) {
  const safePath = getSafeReturnTo(path);
  return new URL(safePath, origin).toString();
}


/**
 * Owner auth may return only to the narrow Labs source-management route family.
 * Keep this separate from getSafeReturnTo(), which intentionally accepts only
 * ordinary /labs destinations.
 */
export function getSafeOwnerReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://portfolio.invalid");
    const isOwnerRoute =
      parsed.origin === "https://portfolio.invalid" &&
      !parsed.search &&
      !parsed.hash &&
      (
        parsed.pathname === "/admin/labs/analytics" ||
        /^\/admin\/labs\/analytics\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed.pathname) ||
        parsed.pathname === "/admin/labs/sources" ||
        parsed.pathname === "/admin/labs/sources/import" ||
        /^\/admin\/labs\/sources\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed.pathname) ||
        /^\/admin\/labs\/experiments\/[a-z0-9]+(?:-[a-z0-9]+)*\/edit$/.test(parsed.pathname)
      );

    return isOwnerRoute ? parsed.pathname : null;
  } catch {
    return null;
  }
}
