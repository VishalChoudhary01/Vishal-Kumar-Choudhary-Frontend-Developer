import { projects } from "./data/projectsSeo";
import { getPublishedCustomLabExperimentPage } from "./lib/labs/public-experiments";
import { buildSiteUrl } from "./lib/seo/urls";

/*
 * SITEMAP — generated from canonical public portfolio and Labs data.
 *
 * Only published Labs records belong here. Private drafts, source URLs and
 * preview/internal routes must never be added to the public sitemap.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap() {
  const base = buildSiteUrl();

  const urls = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${base}/labs`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date("2026-11-04T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  for (const project of projects) {
    const slug = project?.slug;
    if (!slug) continue;

    urls.push({
      url: `${base}/projects/${slug}`,
      lastModified:
        project.updatedAt && project.updatedAt !== ""
          ? new Date(project.updatedAt)
          : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Lab detail URLs use the same MongoDB published-source and exact-ready artifact/version eligibility as the public collection.
  let cursor = null;
  try {
    do {
      const page = await getPublishedCustomLabExperimentPage({ cursor, limit: 24 });
      for (const experiment of page.experiments) {
        if (!experiment?.slug) continue;
        const changedAt = experiment.updatedAt || experiment.publishedAt;
        const lastModified = changedAt ? new Date(changedAt) : null;
        const validLastModified =
          lastModified && !Number.isNaN(lastModified.getTime())
            ? lastModified
            : undefined;

        urls.push({
          url: `${base}/labs/${encodeURIComponent(experiment.slug)}`,
          ...(validLastModified ? { lastModified: validLastModified } : {}),
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
      cursor = page.nextCursor;
    } while (cursor);
  } catch (error) {
    console.error("[sitemap] published Labs URLs unavailable:", error?.code || "PUBLIC_LABS_SITEMAP_ERROR");
  }

  return urls;
}
