import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import LabsPageShell from "@/app/components/labs/LabsPageShell";
import LabDetailHeader from "@/app/components/labs/detail/LabDetailHeader";
import LabExperimentPreview from "@/app/components/labs/LabExperimentPreview";
import LabExplanation from "@/app/components/labs/detail/LabExplanation";
import LabSourceAccess from "@/app/components/labs/detail/LabSourceAccess";
import {
  buildAbsoluteAssetUrl,
  buildSiteUrl,
} from "@/app/lib/seo/urls";
import { getPublishedCustomLabExperimentBySlug } from "@/app/lib/labs/public-experiments";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getLabEngagementSnapshot,
  LABS_GUEST_LIKE_COOKIE,
} from "@/app/lib/labs/engagement";
import { getAuthorizedLabSource } from "@/app/lib/labs/source-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const experiment = await getPublishedCustomLabExperimentBySlug(slug);

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
  const experiment = await getPublishedCustomLabExperimentBySlug(slug);

  if (!experiment) {
    notFound();
  }

  // Resolve source access on the server before rendering the client panel.
  // Verified visitors receive the published source immediately; the guest
  // auth CTAs are never rendered for an already verified session.
  let initialUserId = null;
  let initialAuthUser = null;
  let initialSessionResolved = false;
  let initialIsOwner = false;
  let initialAuthState = "guest";
  let initialSource = null;
  let currentSession = null;
  let initialEngagement = null;
  try {
    const session = await getCurrentAuthSession();
    currentSession = session;
    initialSessionResolved = true;
    initialUserId = session?.user?.id || null;
    initialAuthUser = toLabsAccountUser(session?.user);
    initialIsOwner = session?.user
      ? getLabsOwnerAccessStatus(session.user) === "owner"
      : false;

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
      initialIsOwner={initialIsOwner}
    >
      <main className="min-h-screen bg-background pb-24 text-text-primary sm:pb-32">
        <LabDetailHeader
          experiment={experiment}
          initialEngagement={initialEngagement}
        />
        {experiment.galleryPreview || experiment.generatedPoster || experiment.thumbnail ? (
          <section
            aria-label="Experiment media preview"
            className="mx-auto mt-0 w-full max-w-[1440px] px-6 sm:px-8 lg:px-20"
          >
            <div className="flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-border-subtle bg-surface-2 px-2 py-3 sm:px-4 sm:py-5">
              <LabExperimentPreview
                experiment={experiment}
                sizes="(max-width: 1023px) 100vw, 1280px"
                className="block h-auto max-h-[min(76svh,780px)] w-full object-contain object-center"
              />
            </div>
            <p className="mt-2 text-[10px] text-text-tertiary">
              Project preview
            </p>
          </section>
        ) : null}
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
