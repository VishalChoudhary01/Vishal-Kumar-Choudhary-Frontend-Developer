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
