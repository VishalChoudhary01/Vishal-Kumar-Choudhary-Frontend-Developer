/**
 * Published runtime HTML is delivered from the application origin inside an
 * opaque-origin iframe. The response-header CSP is the only runtime policy.
 */
export function stripPublishedRuntimeCspMeta(html) {
  if (typeof html !== "string") {
    throw new TypeError("Published runtime HTML must be a string.");
  }

  return html
    .replace(
      /<meta\b(?=[^>]*\bhttp-equiv\s*=\s*(?:"content-security-policy"|'content-security-policy'|content-security-policy)(?=[\s/>]))[^>]*\/?>/gi,
      "",
    )
    .replace(/<base\b[^>]*\/?>/gi, "");
}

export function buildPublishedRuntimeCsp({ assetBase, parentOrigin }) {
  let assetUrl;
  let parentUrl;

  try {
    assetUrl = new URL(assetBase);
    parentUrl = new URL(parentOrigin);
  } catch {
    throw new TypeError("Published runtime asset and parent origins must be valid URLs.");
  }

  if (
    assetUrl.protocol !== "https:" ||
    parentUrl.protocol !== "https:" ||
    assetUrl.origin !== parentUrl.origin ||
    !assetUrl.pathname.endsWith("/") ||
    assetUrl.username ||
    assetUrl.password ||
    parentUrl.username ||
    parentUrl.password
  ) {
    throw new TypeError("Published runtime assets must share the trusted HTTPS parent origin.");
  }

  const assetSource = assetUrl.origin + assetUrl.pathname;
  return [
    "default-src 'none'",
    "script-src 'unsafe-inline' " + assetSource,
    "style-src 'unsafe-inline' " + assetSource,
    // Published experiments may reference remote HTTPS image URLs.
    // Keep this permission limited to images; connect-src remains disabled.
    "img-src " + assetSource + " https: data: blob:",
    "font-src " + assetSource + " data:",
    "media-src " + assetSource + " data: blob:",
    "connect-src 'none'",
    "worker-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "frame-ancestors " + parentUrl.origin,
  ].join("; ");
}

function resolveArtifactReference(value, { assetBase, entryPath }) {
  const reference = String(value || "").trim();
  if (
    !reference ||
    reference.startsWith("#") ||
    /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)
  ) {
    return value;
  }

  let base;
  let documentUrl;
  try {
    base = new URL(assetBase);
    documentUrl = new URL(
      entryPath.split("/").map((part) => encodeURIComponent(part)).join("/"),
      base,
    );
  } catch {
    throw new TypeError("The published artifact base or entry path is invalid.");
  }

  // A root-relative URL in an experiment belongs to that experiment, not to
  // the portfolio application's origin root.
  const localReference = reference.replace(/^\/+/, "");
  let resolved;
  try {
    resolved = new URL(localReference, documentUrl);
  } catch {
    throw new TypeError("A published experiment contains an invalid local asset reference.");
  }

  if (
    resolved.origin !== base.origin ||
    !resolved.pathname.startsWith(base.pathname)
  ) {
    throw new TypeError("A published experiment asset reference escapes its immutable artifact.");
  }

  return resolved.href;
}

/**
 * The compiler emits relative Vite URLs, while authored static HTML can use
 * root-relative paths. Resolve both to the same immutable /runtime/:artifactId/
 * namespace before sending HTML to the browser. This prevents the browser from
 * requesting /runtime/assets/... without the artifact ID (the render bug).
 */
export function rewritePublishedRuntimeHtml(html, { assetBase, entryPath = "index.html" }) {
  if (typeof html !== "string") {
    throw new TypeError("Published runtime HTML must be a string.");
  }
  if (typeof assetBase !== "string" || typeof entryPath !== "string") {
    throw new TypeError("Published runtime asset base and entry path are required.");
  }

  const safeHtml = stripPublishedRuntimeCspMeta(html);

  let rewritten = safeHtml.replace(
    /\b(src|href|poster)\s*=\s*(["'])(.*?)\2/gi,
    (match, attribute, quote, value) =>
      attribute + "=" + quote +
      resolveArtifactReference(value, { assetBase, entryPath }) +
      quote,
  );

  rewritten = rewritten.replace(
    /\bsrcset\s*=\s*(["'])(.*?)\1/gi,
    (match, quote, value) => {
      if (/^\s*data:/i.test(value)) return match;
      const candidates = value.split(",").map((candidate) => {
        const parts = candidate.trim().split(/\s+/, 2);
        parts[0] = resolveArtifactReference(parts[0], { assetBase, entryPath });
        return parts.join(" ");
      });
      return "srcset=" + quote + candidates.join(", ") + quote;
    },
  );

  return rewritten;
}
