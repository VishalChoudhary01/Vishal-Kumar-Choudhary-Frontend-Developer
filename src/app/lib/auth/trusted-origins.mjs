const PROJECT_DEPLOYMENT_ORIGINS = Object.freeze([
  "https://vishal-kumar-choudhary-frontend-developer-*.vercel.app",
  "https://vishal-kumar-choudh-git-*-vishal-kumar-choudharys-projects.vercel.app",
]);

/**
 * Keep Better Auth origin validation scoped to this Vercel project.
 *
 * Production's canonical base URL remains the callback origin. These
 * additional HTTPS patterns allow browser sign-in requests made on this
 * project's unique deployment URLs, without trusting arbitrary *.vercel.app
 * hosts or changing the OAuth callback/base URL.
 */
export function buildTrustedAuthOrigins({
  baseURL,
  configuredOrigins = "",
  vercelEnvironment = "",
} = {}) {
  const staticBaseOrigins = typeof baseURL === "string" ? [baseURL] : [];
  const deploymentOrigins = ["production", "preview"].includes(vercelEnvironment)
    ? PROJECT_DEPLOYMENT_ORIGINS
    : [];

  const configured = typeof configuredOrigins === "string"
    ? configuredOrigins.split(",").map((value) => value.trim()).filter(Boolean)
    : [];

  return [...new Set([
    ...staticBaseOrigins,
    ...deploymentOrigins,
    ...configured,
  ])];
}
