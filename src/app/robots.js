import { buildSiteUrl } from "./lib/seo/urls";

/*
 * ROBOTS — allow public portfolio and Labs pages.
 *
 * The repository contains a private /admin workspace and API Route Handlers.
 * Keep those paths out of crawler discovery. Route authorization remains the
 * security boundary; robots.txt is not access control or a replacement for
 * noindex metadata on authentication flows.
export default function robots() {
  const base = buildSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
