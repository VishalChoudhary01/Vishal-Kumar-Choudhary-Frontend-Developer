import { redirect } from "next/navigation";

import AdminBreadcrumbs from "@/app/components/labs/admin/AdminBreadcrumbs";
import LabSnapshotStoragePanel from "@/app/components/labs/admin/LabSnapshotStoragePanel";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LabsSnapshotStoragePage() {
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/sources/snapshots"));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return <LabsOwnerAccessNotice status={ownerStatus} />;
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <AdminBreadcrumbs items={[{ href: "/admin/labs/sources", label: "Back to Source Management" }]} />

        <LabsOwnerNavigation active="snapshots" user={toLabsAccountUser(session.user)} />

        <header className="mt-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">OWNER TOOLS / VERCEL SANDBOX</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Snapshot storage
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Monitor this project's Sandbox snapshots, inspect dependency and retention details, and remove only confirmed-unused automatic snapshots.
          </p>
        </header>

        <LabSnapshotStoragePanel />
      </div>
    </main>
  );
}
