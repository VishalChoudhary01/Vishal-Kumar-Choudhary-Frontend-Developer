import { projects } from "./data/projectsSeo";
import { publishedLabExperiments } from "./data/labsExperiments";
import { buildSiteUrl } from "./lib/seo/urls";

/*
 * SITEMAP — generated from canonical public portfolio and Labs data.
 *
 * Only published Labs records belong here. Private drafts, source URLs and
 * preview/internal routes must never be added to the public sitemap.
 */
export default function sitemap() {
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
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
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

  for (const experiment of publishedLabExperiments) {
    const slug = experiment?.slug;
    if (!slug) continue;

    urls.push({
      url: `${base}/labs/${encodeURIComponent(slug)}`,
      lastModified:
        experiment.updatedAt && experiment.updatedAt !== ""
          ? new Date(experiment.updatedAt)
          : undefined,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return urls;
}
