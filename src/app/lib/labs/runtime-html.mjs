/**
 * The published artifact response supplies a path-scoped HTTP CSP for its
 * opaque-origin iframe. A build-time meta CSP that uses 'self' conflicts with
 * that opaque origin and blocks the artifact's own JS/CSS bundles.
 *
 * Remove only that redundant policy meta element. The response-header CSP
 * remains the authoritative runtime policy; other metadata is preserved.
 */
export function stripPublishedRuntimeCspMeta(html) {
  if (typeof html !== "string") {
    throw new TypeError("Published runtime HTML must be a string.");
  }

  return html.replace(
    /<meta\b(?=[^>]*\bhttp-equiv\s*=\s*(?:"content-security-policy"|'content-security-policy'|content-security-policy)(?=[\s/>]))[^>]*\/?>/gi,
    "",
  );
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
    "img-src " + assetSource + " data: blob:",
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
