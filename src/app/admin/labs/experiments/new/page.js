import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabExperimentCreateForm from "@/app/components/labs/admin/LabExperimentCreateForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewLabExperimentPage() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/experiments/new"));
  }
  const status = getLabsOwnerAccessStatus(session.user);
  if (status !== "owner") return <LabsOwnerAccessNotice status={status} />;
  return <LabExperimentCreateForm />;
}
