import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
        <Link
          href="/admin/labs/sources"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Source Library
        </Link>

        <LabsOwnerNavigation active="sources" user={toLabsAccountUser(session.user)} />

        <header className="mt-8 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            OWNER EXPERIMENT DETAILS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
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
