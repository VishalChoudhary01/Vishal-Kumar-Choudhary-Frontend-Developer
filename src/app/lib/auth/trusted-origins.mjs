const PROJECT_DEPLOYMENT_HOST =
  /^vishal-kumar-choudhary-frontend-developer-[a-z0-9-]+\.vercel\.app$/i;
const PROJECT_BRANCH_ALIAS_HOST =
  /^vishal-kumar-choudh-git-[a-z0-9-]+-vishal-kumar-choudharys-projects\.vercel\.app$/i;
const PROJECT_STATIC_ALIAS_HOST =
  /^vishal-kumar-choudhary-fronten-vishal-kumar-choudharys-projects\.vercel\.app$/i;

function normalizeExactOrigin(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.port
    ) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
}

function normalizeDeploymentHost(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const candidate = value.trim();
  return normalizeExactOrigin(
    /^https?:\/\//i.test(candidate) ? candidate : "https://" + candidate,
  );
}

function isThisProjectDeploymentOrigin(value) {
  const origin = normalizeExactOrigin(value);
  if (!origin) return false;

  const hostname = new URL(origin).hostname.toLowerCase();
  return (
    hostname === "vishal-kumar-choudhary-frontend-developer.vercel.app" ||
    PROJECT_DEPLOYMENT_HOST.test(hostname) ||
    PROJECT_BRANCH_ALIAS_HOST.test(hostname) ||
    PROJECT_STATIC_ALIAS_HOST.test(hostname)
  );
}

function addProjectDeploymentOrigin(origins, value, { allowHostOnly = false } = {}) {
  const origin = allowHostOnly
    ? normalizeDeploymentHost(value)
    : normalizeExactOrigin(value);

  if (origin && isThisProjectDeploymentOrigin(origin) && !origins.includes(origin)) {
    origins.push(origin);
  }
}

/**
 * Better Auth calls this resolver for each HTTP request. Trust a deployment
 * origin only after validating its HTTPS scheme and exact project hostname.
 *
 * When Better Auth invokes auth.api directly (request is undefined), include
 * only the validated Vercel deployment URL/branch URL plus canonical and
 * explicitly configured origins. Never trust an arbitrary Origin header.
 */
export function buildTrustedAuthOrigins({
  baseURL,
  configuredOrigins = "",
  vercelEnvironment = "",
  vercelURL = "",
  vercelBranchURL = "",
  request,
} = {}) {
  const configuredBaseURL = typeof baseURL === "string"
    ? baseURL
    : typeof baseURL?.fallback === "string"
      ? baseURL.fallback
      : "";

  const origins = [];
  if (configuredBaseURL) origins.push(configuredBaseURL);

  const configured = typeof configuredOrigins === "string"
    ? configuredOrigins.split(",").map((value) => value.trim()).filter(Boolean)
    : [];

  for (const origin of configured) {
    if (!origins.includes(origin)) origins.push(origin);
  }

  if (!["production", "preview"].includes(vercelEnvironment)) {
    return origins;
  }

  addProjectDeploymentOrigin(origins, vercelURL, { allowHostOnly: true });
  addProjectDeploymentOrigin(origins, vercelBranchURL, { allowHostOnly: true });

  const requestOrigin = request?.headers?.get?.("origin");
  addProjectDeploymentOrigin(origins, requestOrigin);

  return origins;
}
