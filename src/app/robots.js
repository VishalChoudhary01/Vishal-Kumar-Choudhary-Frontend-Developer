import { buildSiteUrl } from "./lib/seo/urls";

/*
 * ROBOTS — allow public portfolio and Labs pages.
 *
 * The repository contains a private /admin workspace. Keep that application
 * area out of crawler discovery. The public static poster route currently
 * uses /api/v1/labs/...; do not disallow all /api paths or crawlers may be
 * prevented from fetching images used by public Labs metadata.
 *
 * Route authorization remains the security boundary. robots.txt is not
 * access control and is not a replacement for noindex metadata.
 */
export default function robots() {
  const base = buildSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
