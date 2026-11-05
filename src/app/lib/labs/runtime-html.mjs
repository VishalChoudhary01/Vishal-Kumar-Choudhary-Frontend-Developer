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
