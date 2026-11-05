import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabsIntroduction from "@/app/components/labs/LabsIntroduction";
import FeaturedExperiment from "@/app/components/labs/FeaturedExperiment";
import LabsCollection from "@/app/components/labs/LabsCollection";
import {
  featuredLabExperiment,
  publishedLabExperiments,
} from "@/app/data/labsExperiments";
import { buildSiteUrl } from "@/app/lib/seo/urls";
import { getPublishedCustomLabExperiments } from "@/app/lib/labs/public-experiments";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_TITLE = "Labs — Frontend Experiments";
const PAGE_DESCRIPTION =
  "Frontend experiments exploring motion, interface interactions, CSS, and creative coding.";

export function generateMetadata() {
  const canonical = `${buildSiteUrl()}/labs`;

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: canonical,
      siteName: "Vishal Kumar Choudhary",
    },
    twitter: {
      card: "summary",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  };
}

export default async function LabsPage() {
  const customExperiments = await getPublishedCustomLabExperiments();
  const experiments = [...publishedLabExperiments, ...customExperiments];

  return (
    <LabsPageShell>
      <main className="min-h-screen bg-background text-text-primary">
        <LabsIntroduction
          experimentCount={experiments.length}
          categoryCount={
            new Set(experiments.map((experiment) => experiment.category)).size
          }
        />
        {featuredLabExperiment ? (
          <FeaturedExperiment experiment={featuredLabExperiment} />
        ) : null}
        <LabsCollection experiments={experiments} />
      </main>
    </LabsPageShell>
  );
}
