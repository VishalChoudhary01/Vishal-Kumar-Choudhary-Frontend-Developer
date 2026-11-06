import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabsIntroduction from "@/app/components/labs/LabsIntroduction";
import FeaturedExperiment from "@/app/components/labs/FeaturedExperiment";
import LabsCollection from "@/app/components/labs/LabsCollection";
import {
  featuredLabExperiment,
  publishedLabExperiments,
} from "@/app/data/labsExperiments";
import { buildSiteUrl } from "@/app/lib/seo/urls";
import { cookies } from "next/headers";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getLabEngagementSnapshot,
  LABS_GUEST_LIKE_COOKIE,
} from "@/app/lib/labs/engagement";
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

  let session = null;
  let authState = "unknown";
  let sessionResolved = false;

  try {
    session = await getCurrentAuthSession();
    sessionResolved = true;

    if (session?.user?.id) {
      authState = session.user.emailVerified === true ? "verified" : "unverified";
    } else {
      authState = "guest";
    }
  } catch (error) {
    console.error(
      "[labs-page] auth state resolution failed:",
      error?.code || "AUTH_SESSION_READ_ERROR",
    );
  }

  let engagementBySlug = {};
  if (sessionResolved) {
    try {
      const cookieStore = await cookies();
      engagementBySlug = await getLabEngagementSnapshot({
        slugs: experiments.map((experiment) => experiment.slug),
        session,
        guestCookieValue: cookieStore.get(LABS_GUEST_LIKE_COOKIE)?.value || "",
      });
    } catch (error) {
      console.error(
        "[labs-page] engagement snapshot failed:",
        error?.code || "ENGAGEMENT_READ_ERROR",
      );
    }
  }

  const hasFeaturedExperiment =
    Boolean(featuredLabExperiment?.slug) &&
    experiments.some((experiment) => experiment.slug === featuredLabExperiment.slug);

  return (
    <LabsPageShell>
      <main className="min-h-screen bg-background text-text-primary">
        <LabsIntroduction
          experimentCount={experiments.length}
          categoryCount={
            new Set(experiments.map((experiment) => experiment.category)).size
          }
          authState={authState}
          featuredHref={
            hasFeaturedExperiment ? `/labs/${featuredLabExperiment.slug}` : null
          }
        />
        {featuredLabExperiment ? (
          <FeaturedExperiment experiment={featuredLabExperiment} />
        ) : null}
        <LabsCollection experiments={experiments} engagementBySlug={engagementBySlug} />
      </main>
    </LabsPageShell>
  );
}
