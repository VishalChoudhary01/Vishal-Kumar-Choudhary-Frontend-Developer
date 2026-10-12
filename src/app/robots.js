import { buildSiteUrl } from "./lib/seo/urls";

/*
 * ROBOTS — allow all public routes (spec §22).
 *
 * No disallow entries: /debug, /internal, /admin do not exist in this
 * project, and fake paths must not be added just for appearance.
 * Robots.txt is not a substitute for noindex.
 */
export default function robots() {
  const base = buildSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
