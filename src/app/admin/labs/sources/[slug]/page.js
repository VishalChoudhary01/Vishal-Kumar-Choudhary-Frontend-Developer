import { notFound, redirect } from "next/navigation";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";
import {
  getOwnerLabSource,
  listOwnerLabVersions,
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
  if (!isLabsOwner(session.user)) notFound();

  const { slug } = await params;

  try {
    const [source, versions] = await Promise.all([
      getOwnerLabSource({ user: session.user, slug }),
      listOwnerLabVersions({ user: session.user, slug }),
    ]);

    return <LabSourceEditor initialSource={source} initialVersions={versions} />;
  } catch (error) {
    if (error?.code === "NOT_FOUND") notFound();
    throw error;
  }
}
