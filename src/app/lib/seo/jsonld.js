/*
 * JSON-LD BUILDERS — structured data that mirrors visible page content.
 *
 * Spec §13 / §33 / §35:
 *   - Person / WebSite / ProfilePage on the homepage.
 *   - CreativeWork + creator Person on project pages.
 *   - Only real public profiles in sameAs (no invented profiles).
 *   - No fake SearchAction, ratings, reviews, metrics, or clients.
 */

import { buildSiteUrl } from "./urls";

const PERSON_NAME = "Vishal Kumar Choudhary";
const PERSON_JOB_TITLE = "Frontend Developer";
const SITE_NAME = "Vishal Kumar Choudhary";

const PERSON_ID_PATH = "/#person";
const WEBSITE_ID_PATH = "/#website";
const PROFILE_PAGE_ID_PATH = "/#profilepage";

/**
 * Real public social profiles only (spec §13: "Do not invent profiles").
 * Email compose links (mailto / mail.google.com) are NOT profiles and
 * are excluded from sameAs.
 */
function collectProfileUrls(socialLinks) {
  const profiles = [];

  for (const link of socialLinks || []) {
    const href = link?.href;

    if (typeof href !== "string" || href.trim() === "") continue;
    if (/^mailto:/i.test(href)) continue;
    if (href.includes("mail.google.com")) continue;

    try {
      new URL(href);
      profiles.push(href);
    } catch {
      continue;
    }
  }

  return profiles;
}

export function buildPersonJsonLd(siteUrl, socialLinks) {
  const person = {
    "@type": "Person",
    "@id": `${siteUrl}${PERSON_ID_PATH}`,
    name: PERSON_NAME,
    jobTitle: PERSON_JOB_TITLE,
    url: `${siteUrl}/`,
  };

  const sameAs = collectProfileUrls(socialLinks);

  if (sameAs.length) {
    person.sameAs = sameAs;
  }

  return person;
}

export function buildWebsiteJsonLd(siteUrl) {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}${WEBSITE_ID_PATH}`,
    url: `${siteUrl}/`,
    name: `${PERSON_NAME} — Frontend Developer`,
    description:
      "Portfolio of Vishal Kumar Choudhary, a frontend developer building polished, responsive web experiences with React, Next.js, JavaScript, Tailwind CSS, and Motion.",
    publisher: { "@id": `${siteUrl}${PERSON_ID_PATH}` },
  };
}

/*
 * No potentialAction SearchAction: the site has no search feature and
 * structured data must not advertise functionality that does not exist
 * (spec §35: no fake structured data).
 */
export function buildProfilePageJsonLd(siteUrl) {
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl}${PROFILE_PAGE_ID_PATH}`,
    url: `${siteUrl}/`,
    mainEntity: { "@id": `${siteUrl}${PERSON_ID_PATH}` },
  };
}

export function buildProjectJsonLd(project, projectUrl, imageUrl) {
  if (!project) {
    return null;
  }

  const siteUrl = buildSiteUrl();

  const jsonLd = {
    "@type": "CreativeWork",
    "@id": `${projectUrl}/#work`,
    name: project.name,
    description: project.seo?.description || project.description,
    url: projectUrl,
    creator: {
      "@type": "Person",
      name: PERSON_NAME,
      url: `${siteUrl}/`,
    },
  };

  if (imageUrl) {
    jsonLd.image = imageUrl;
  }

  if (typeof project.year === "string" && project.year) {
    jsonLd.dateCreated = project.year;
  }

  if (Array.isArray(project.technologies) && project.technologies.length) {
    jsonLd.keyword = project.technologies;
  }

  return jsonLd;
}

export { PERSON_NAME, PERSON_JOB_TITLE, SITE_NAME };
