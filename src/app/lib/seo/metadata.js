/*
 * METADATA BUILDERS — homepage head metadata + homepage JSON-LD graph.
 *
 * Spec §3 / §4 / §13:
 *   - Title: "Vishal Kumar Choudhary — Frontend Developer"
 *   - Description: source-derived, no unverified claims.
 *   - Canonical, Open Graph, Twitter/X on the homepage.
 *   - JSON-LD graph: WebSite → ProfilePage → Person (sameAs = real profiles only).
 */

import { buildPersonJsonLd, buildWebsiteJsonLd, buildProfilePageJsonLd } from "./jsonld"
import { buildSiteUrl, buildAbsoluteAssetUrl } from "./urls";

export const SITE_TITLE = "Vishal Kumar Choudhary — Frontend Developer";

export const SITE_DESCRIPTION =
  "Portfolio of Vishal Kumar Choudhary, a frontend developer building polished, responsive web experiences with React, Next.js, JavaScript, Tailwind CSS, and Motion.";

const SOCIAL_IMAGE = "/og-vishal-kumar-choudhary.webp";

export function buildHomeMetadata() {
  const siteUrl = buildSiteUrl();
  const image = buildAbsoluteAssetUrl(SOCIAL_IMAGE);

  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,

    alternates: {
      canonical: `${siteUrl}/`,
    },

    openGraph: {
      type: "website",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: `${siteUrl}/`,
      siteName: "Vishal Kumar Choudhary",
      images: image
        ? [
            {
              url: image,
              alt: "Vishal Kumar Choudhary — Frontend Developer",
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: image ? [image] : [],
    },
  };
}

export function buildHomeJsonLd(socialLinks) {
  const siteUrl = buildSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteJsonLd(siteUrl),
      buildProfilePageJsonLd(siteUrl),
      buildPersonJsonLd(siteUrl, socialLinks),
    ],
  };
}
