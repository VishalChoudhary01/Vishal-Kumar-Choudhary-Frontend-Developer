import { projects } from "./data/projectsSeo";
import { buildSiteUrl } from "./lib/seo/urls";

/*
 * SITEMAP — generated from canonical project data (spec §21).
 *
 * Lives in src/app (this project's App Router root).
 * URLs come from the shared URL layer so no localhost or
 * example.com can ever leak into production output.
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

  return urls;
}
