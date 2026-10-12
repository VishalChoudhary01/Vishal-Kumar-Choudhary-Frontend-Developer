import { notFound } from "next/navigation";

import JsonLd from "@/app/components/seo/JsonLd";
import { portfolio } from "@/app/data/portfolio";
import { buildProjectUrl, buildAbsoluteAssetUrl } from "@/app/lib/seo/urls";
import { buildProjectJsonLd } from "@/app/lib/seo/jsonld";
import ProjectPageView from "./ProjectPageView";

/*
 * Project detail page — server component (spec §2, §6, §21, §23).
 *
 * - generateStaticParams: every canonical project slug is prerendered.
 * - generateMetadata: canonical URL, Open Graph, Twitter/X per project.
 * - Unknown slugs return a real 404 via notFound().
 * - JSON-LD (CreativeWork) is rendered server-side, outside the client
 *   loader lifecycle, so it is always present in the initial HTML.
 * - The visible UI lives in ProjectPageView (client) — it keeps content
 *   mounted (visibility-gated only) so text is never absent from HTML.
 */

export function generateStaticParams() {
  return portfolio.projects
    .filter((project) => project?.slug)
    .map((project) => ({ slug: project.slug }));
}

/* Only the canonical slugs above are valid routes. Unknown slugs return
   the fully server-rendered root 404 instead of an empty dynamic shell. */
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = portfolio.projects.find((item) => item.slug === slug);

  if (!project) {
    return {};
  }

  const title = project.seo?.title || `${project.name} — Frontend Developer`;
  const description = project.seo?.description || project.description;
  const projectUrl = buildProjectUrl(project.slug);
  const imageUrl = buildAbsoluteAssetUrl(project.media?.src);

  return {
    title,
    description,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: projectUrl,
      siteName: "Vishal Kumar Choudhary",
      images:
        imageUrl && project.media?.alt
          ? [
              {
                url: imageUrl,
                alt: project.media.alt,
              },
            ]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;

  const projectIndex = portfolio.projects.findIndex(
    (item) => item.slug === slug
  );

  if (projectIndex === -1) {
    notFound();
  }

  const project = portfolio.projects[projectIndex];

  const previousProject =
    projectIndex > 0 ? portfolio.projects[projectIndex - 1] : null;

  const followingProject =
    projectIndex < portfolio.projects.length - 1
      ? portfolio.projects[projectIndex + 1]
      : null;

  const prevProject = previousProject
    ? {
        name: previousProject.name,
        href: `/projects/${previousProject.slug}`,
      }
    : null;

  const nextProject = followingProject
    ? {
        name: followingProject.name,
        href: `/projects/${followingProject.slug}`,
      }
    : null;

  const projectUrl = buildProjectUrl(project.slug);
  const imageUrl = buildAbsoluteAssetUrl(project.media?.src);

  const jsonLd = buildProjectJsonLd(project, projectUrl, imageUrl);

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ProjectPageView
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
      />
    </>
  );
}
