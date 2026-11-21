const NATIVE_SCROLL_ROOTS = ["/labs", "/admin"];
const NATIVE_SOURCE_ROUTES = new Set(["import", "snapshots"]);
const SOURCE_EDITOR_ROUTE = /^\/admin\/labs\/sources\/([^/]+)$/;

function isWithinRoute(pathname, root) {
  return pathname === root || pathname.startsWith(root + "/");
}

function isLabsSourceEditorRoute(pathname) {
  const match = pathname.match(SOURCE_EDITOR_ROUTE);
  return Boolean(match && !NATIVE_SOURCE_ROUTES.has(match[1].toLowerCase()));
}

/**
 * Lenis is enabled on public portfolio/project routes and the owner Labs
 * source editor only. Other Labs/admin pages retain native document scrolling.
 */
export function shouldUseLenis(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return false;

  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (isLabsSourceEditorRoute(normalizedPathname)) return true;

  return !NATIVE_SCROLL_ROOTS.some((root) =>
    isWithinRoute(normalizedPathname, root),
  );
}
