import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabsIntroduction from "@/app/components/labs/LabsIntroduction";
import FeaturedExperiment from "@/app/components/labs/FeaturedExperiment";
import LabsCollection from "@/app/components/labs/LabsCollection";
import { LAB_CATEGORIES } from "@/app/lib/labs/categories.mjs";
import { resolveFeaturedExperiment } from "@/app/lib/labs/featured-experiment.mjs";
import { buildSiteUrl } from "@/app/lib/seo/urls";
import { cookies } from "next/headers";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isAuthRuntimeConfigured } from "@/app/lib/auth/auth";
import {
  getLabEngagementSnapshot,
  LABS_GUEST_LIKE_COOKIE,
} from "@/app/lib/labs/engagement";
import { getPublishedCustomLabExperimentPage } from "@/app/lib/labs/public-experiments";

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
  const customPage = await getPublishedCustomLabExperimentPage({
    limit: 18,
    includeCategoryCounts: true,
  });
  const experiments = customPage.experiments;
  const totalExperimentCount = customPage.totalCount;
  const categoryCounts = customPage.categoryCounts;
  const activeCategoryCount = Object.values(categoryCounts).filter(
    (count) => Number(count) > 0,
  ).length;

  let session = null;
  let authState = "unknown";
  let sessionResolved = false;

  try {
    session = await getCurrentAuthSession();
    sessionResolved = true;

    if (isAuthRuntimeConfigured()) {
      if (session?.user?.id) {
        authState = session.user.emailVerified === true ? "verified" : "unverified";
      } else {
        authState = "guest";
      }
    } else {
      authState = "unknown";
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

  // Resolve the spotlight only from the currently eligible source-backed page.
  const featuredExperiment = resolveFeaturedExperiment(experiments);

  return (
    <LabsPageShell>
      <main className="min-h-screen bg-background text-text-primary">
        <LabsIntroduction
          experimentCount={totalExperimentCount}
          categoryCount={activeCategoryCount}
          authState={authState}
          featuredHref={
            featuredExperiment ? `/labs/${featuredExperiment.slug}` : null
          }
        />
        {featuredExperiment ? (
          <FeaturedExperiment experiment={featuredExperiment} />
        ) : null}
        <LabsCollection
          initialCustomPage={customPage}
          totalCount={totalExperimentCount}
          categoryCounts={categoryCounts}
          engagementBySlug={engagementBySlug}
        />
      </main>
    </LabsPageShell>
  );
}
