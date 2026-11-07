const NATIVE_SCROLL_ROOTS = ["/labs", "/admin"];

function isWithinRoute(pathname, root) {
  return pathname === root || pathname.startsWith(root + "/");
}

/**
 * Lenis is reserved for the public portfolio and project-detail experience.
 * Labs and owner/admin workspaces use native document scrolling so wheel
 * input is never captured by a second scroll controller around editors,
 * tables, previews or long management pages.
 */
export function shouldUseLenis(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return false;
  }

  return !NATIVE_SCROLL_ROOTS.some((root) => isWithinRoute(pathname, root));
}
