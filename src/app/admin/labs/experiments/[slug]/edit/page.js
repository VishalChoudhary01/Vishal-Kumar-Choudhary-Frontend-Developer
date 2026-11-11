import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon as AnimatedArrowLeft } from "@animateicons/react/lucide/arrow-left-icon";
import { ChevronRightIcon as AnimatedChevronRight } from "@animateicons/react/lucide/chevron-right-icon";
import { PencilIcon as AnimatedPencil } from "@animateicons/react/lucide/pencil-icon";

import LabExperimentMetadataEditor from "@/app/components/labs/admin/LabExperimentMetadataEditor";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import { getOwnerLabExperiment } from "@/app/lib/labs/experiment-management";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditLabExperimentPage({ params }) {
  const { slug } = await params;
  const returnTo = "/admin/labs/experiments/" + encodeURIComponent(slug) + "/edit";
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent(returnTo));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return (
      <LabsOwnerAccessNotice
        status={ownerStatus}
        returnTo={returnTo}
      />
    );
  }

  let experiment;
  try {
    experiment = await getOwnerLabExperiment({ user: session.user, slug });
  } catch (error) {
    if (error?.code === "NOT_FOUND") notFound();
    throw error;
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/admin/labs/sources"
            className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <AnimatedArrowLeft size={14} duration={0.68} aria-hidden="true" />
            Source Library
          </Link>
          <AnimatedChevronRight size={13} duration={0.62} className="text-text-tertiary" aria-hidden="true" />
          <span aria-current="page" className="text-text-primary">Edit experiment</span>
        </nav>

        <LabsOwnerNavigation active="sources" user={toLabsAccountUser(session.user)} />

        <header className="mt-8 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            OWNER EXPERIMENT DETAILS
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            <AnimatedPencil size={23} duration={0.68} className="shrink-0 text-brand" aria-hidden="true" />
            Edit experiment details
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Update the catalogue information shown for this custom experiment. Source files, saved code versions and the published runtime are managed separately.
          </p>
        </header>

        <LabExperimentMetadataEditor initialExperiment={experiment} />
      </div>
    </main>
  );
}
