import { redirect, notFound } from "next/navigation";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import {
  getOwnerLabSource,
  listOwnerLabVersions,
  listOwnerLabAuditEvents,
} from "@/app/lib/labs/source-management";
import LabSourceEditor from "@/app/components/labs/admin/LabSourceEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LabsSourceEditorPage({ params }) {
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    const { slug } = await params;
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/sources/" + slug));
  }
  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") return <LabsOwnerAccessNotice status={ownerStatus} />;

  const { slug } = await params;

  let source;
  let versions;
  let audit;

  try {
    [source, versions, audit] = await Promise.all([
      getOwnerLabSource({ user: session.user, slug }),
      listOwnerLabVersions({ user: session.user, slug }),
      listOwnerLabAuditEvents({ user: session.user, slug, limit: 20 }),
    ]);
  } catch (error) {
    if (error?.code === "NOT_FOUND") notFound();
    throw error;
  }

  return (
    <LabSourceEditor
      initialSource={source}
      initialVersions={versions}
      initialAudit={audit}
    />
  );
}
