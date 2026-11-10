const CSP_META_PATTERN =
  /<meta\b(?=[^>]*\bhttp-equiv\s*=\s*(?:"content-security-policy"|'content-security-policy'|content-security-policy)(?=[\s/>]))[^>]*\/?>/i;
const CSP_CONTENT_PATTERN = /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i;

/**
 * Compatibility policy for owner previews built from an older immutable
 * compiler snapshot. Adds HTTPS only to img-src; every other directive is
 * preserved byte-for-byte.
 */
export function allowHttpsImagesInPreviewHtml(html) {
  if (typeof html !== "string") {
    throw new TypeError("Preview HTML must be a string.");
  }

  const metaMatch = CSP_META_PATTERN.exec(html);
  if (!metaMatch) {
    throw new Error("The compiled preview is missing its Content Security Policy meta tag.");
  }

  const metaTag = metaMatch[0];
  const contentMatch = CSP_CONTENT_PATTERN.exec(metaTag);
  if (!contentMatch) {
    throw new Error("The compiled preview CSP meta tag is missing its content attribute.");
  }

  const currentPolicy = contentMatch[2];
  const directives = currentPolicy.split(";").map((value) => value.trim()).filter(Boolean);
  const imageDirectiveIndex = directives.findIndex((directive) => {
    return directive.split(/\s+/, 1)[0]?.toLowerCase() === "img-src";
  });

  if (imageDirectiveIndex === -1) {
    directives.push("img-src https:");
  } else {
    const tokens = directives[imageDirectiveIndex].split(/\s+/);
    if (!tokens.some((token) => token.toLowerCase() === "https:")) {
      directives[imageDirectiveIndex] += " https:";
    }
  }

  const nextPolicy = directives.join("; ");
  if (nextPolicy === currentPolicy) {
    return html;
  }

  const quote = contentMatch[1];
  const nextMetaTag =
    metaTag.slice(0, contentMatch.index) +
    "content=" + quote + nextPolicy + quote +
    metaTag.slice(contentMatch.index + contentMatch[0].length);

  return html.slice(0, metaMatch.index) +
    nextMetaTag +
    html.slice(metaMatch.index + metaTag.length);
}
