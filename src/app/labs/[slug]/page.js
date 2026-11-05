import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabDetailHeader from "@/app/components/labs/detail/LabDetailHeader";
import LabWorkspace from "@/app/components/labs/detail/LabWorkspace";
import LabExplanation from "@/app/components/labs/detail/LabExplanation";
import LabSourceAccess from "@/app/components/labs/detail/LabSourceAccess";
import {
  getPublishedLabExperimentBySlug,
  publishedLabExperiments,
} from "@/app/data/labsExperiments";
import {
  buildAbsoluteAssetUrl,
  buildSiteUrl,
} from "@/app/lib/seo/urls";
import { getPublishedCustomLabExperimentBySlug } from "@/app/lib/labs/public-experiments";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getLabEngagementSnapshot,
  LABS_GUEST_LIKE_COOKIE,
} from "@/app/lib/labs/engagement";
import { getAuthorizedLabSource } from "@/app/lib/labs/source-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  return publishedLabExperiments.map((experiment) => ({
    slug: experiment.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const experiment =
    getPublishedLabExperimentBySlug(slug) ||
    await getPublishedCustomLabExperimentBySlug(slug);

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
  const experiment =
    getPublishedLabExperimentBySlug(slug) ||
    await getPublishedCustomLabExperimentBySlug(slug);

  if (!experiment) {
    notFound();
  }

  // Resolve source access on the server before rendering the client panel.
  // Verified visitors receive the published source immediately; the guest
  // auth CTAs are never rendered for an already verified session.
  let initialUserId = null;
  let initialAuthUser = null;
  let initialSessionResolved = false;
  let initialAuthState = "guest";
  let initialSource = null;
  let currentSession = null;
  let initialEngagement = null;
  try {
    const session = await getCurrentAuthSession();
    currentSession = session;
    initialSessionResolved = true;
    initialUserId = session?.user?.id || null;
    initialAuthUser = initialUserId
      ? {
          id: initialUserId,
          email: session.user.email || "",
          emailVerified: session.user.emailVerified === true,
        }
      : null;

    if (initialUserId && session.user.emailVerified === true) {
      initialAuthState = "verified";
      const result = await getAuthorizedLabSource({
        user: session.user,
        slug,
      });

      if (result.status === "ok") {
        initialSource = result.data;
      } else if (result.status === "not-found") {
        initialAuthState = "unpublished";
      } else {
        initialAuthState = "error";
      }
    } else if (initialUserId) {
      initialAuthState = "verification";
    }
  } catch (error) {
    console.error("[labs-detail] initial source lookup failed:", error?.code || "SOURCE_LOOKUP_ERROR");
    initialAuthState = initialUserId ? "error" : "guest";
  }

  try {
    const cookieStore = await cookies();
    const snapshot = await getLabEngagementSnapshot({
      slugs: [slug],
      session: currentSession,
      guestCookieValue: cookieStore.get(LABS_GUEST_LIKE_COOKIE)?.value || "",
    });
    initialEngagement = snapshot[slug] || null;
  } catch (error) {
    console.error("[labs-detail] engagement snapshot failed:", error?.code || "ENGAGEMENT_READ_ERROR");
  }

  return (
    <LabsPageShell
      initialAuthUser={initialAuthUser}
      initialSessionResolved={initialSessionResolved}
    >
      <main className="min-h-screen bg-background pb-24 text-text-primary sm:pb-32">
        <LabDetailHeader
          experiment={experiment}
          initialEngagement={initialEngagement}
        />
        <LabWorkspace key={experiment.slug} experiment={experiment} />
        <LabExplanation explanation={experiment.explanation} />
        <LabSourceAccess
          key={experiment.slug}
          slug={experiment.slug}
          initialUserId={initialUserId}
          initialAuthState={initialAuthState}
          initialSource={initialSource}
        />
      </main>
    </LabsPageShell>
  );
}
