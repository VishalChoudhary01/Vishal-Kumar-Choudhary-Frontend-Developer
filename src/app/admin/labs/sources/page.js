import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileCode2 } from "lucide-react";

import LabSourceInventory from "@/app/components/labs/admin/LabSourceInventory";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LabsSourceLibraryPage({ searchParams }) {
  const query = await searchParams;
  const legacyPeriod = Number(query?.days);

  // Preserve old Analytics bookmarks while the Sources route becomes the
  // dedicated library. Only recognized period values are forwarded.
  if ([7, 30, 90, 365].includes(legacyPeriod)) {
    redirect("/admin/labs/analytics?days=" + legacyPeriod);
  }

  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/sources"));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return <LabsOwnerAccessNotice status={ownerStatus} />;
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/labs"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Labs
        </Link>

        <LabsOwnerNavigation active="sources" user={toLabsAccountUser(session.user)} />

        <div className="mt-5 flex justify-end">
          <Link
            href="/admin/labs/sources/import"
            className="inline-flex h-9 items-center gap-2 border border-brand/40 bg-brand-soft/30 px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <FileCode2 size={14} aria-hidden="true" />
            Initialize sources
          </Link>
        </div>

        <LabSourceInventory />
      </div>
    </main>
  );
}
