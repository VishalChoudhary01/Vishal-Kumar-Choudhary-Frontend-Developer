import { notFound } from "next/navigation";

import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabDetailHeader from "@/app/components/labs/detail/LabDetailHeader";
import LabWorkspace from "@/app/components/labs/detail/LabWorkspace";
import LabExplanation from "@/app/components/labs/detail/LabExplanation";
import LabSourceAccess from "@/app/components/labs/detail/LabSourceAccess";
import LabEngagement from "@/app/components/labs/detail/LabEngagement";
import {
  getPublishedLabExperimentBySlug,
  publishedLabExperiments,
} from "@/app/data/labsExperiments";
import {
  buildAbsoluteAssetUrl,
  buildSiteUrl,
} from "@/app/lib/seo/urls";

export async function generateStaticParams() {
  return publishedLabExperiments.map((experiment) => ({
    slug: experiment.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const experiment = getPublishedLabExperimentBySlug(slug);

  if (!experiment) return {};

  const title = experiment.seo?.title || `${experiment.title} — Labs`;
  const description =
    experiment.seo?.description || experiment.description || "";
  const canonical = `${buildSiteUrl()}/labs/${encodeURIComponent(slug)}`;
  const image = buildAbsoluteAssetUrl(experiment.thumbnail?.src);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "Vishal Kumar Choudhary",
      images: image
        ? [{ url: image, alt: experiment.thumbnail?.alt || experiment.title }]
        : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function LabExperimentPage({ params }) {
  const { slug } = await params;
  const experiment = getPublishedLabExperimentBySlug(slug);

  if (!experiment) {
    notFound();
  }

  return (
    <LabsPageShell>
      <main className="min-h-screen bg-background pb-24 text-text-primary sm:pb-32">
        <LabDetailHeader experiment={experiment} />
        <LabWorkspace key={experiment.slug} experiment={experiment} />
        <LabExplanation explanation={experiment.explanation} />
        <LabEngagement slug={experiment.slug} />
        <LabSourceAccess slug={experiment.slug} />
      </main>
    </LabsPageShell>
  );
}
