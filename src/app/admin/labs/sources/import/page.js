import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import LabRuntimeImportPanel from "@/app/components/labs/admin/LabRuntimeImportPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImportRuntimePage() {
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/sources/import"));
  }

  const status = getLabsOwnerAccessStatus(session.user);
  if (status !== "owner") {
    return (
      <LabsOwnerAccessNotice
        status={status}
        returnTo="/admin/labs/sources/import"
      />
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/labs/sources"
          className="text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Source Library
        </Link>
        <LabsOwnerNavigation active="sources" />
        <header className="mt-8 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            SOURCE LIBRARY
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Runtime source initialization
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Import the reviewed runtime source into an owner-managed workspace.
          </p>
        </header>
        <LabRuntimeImportPanel />
      </div>
    </main>
  );
}
