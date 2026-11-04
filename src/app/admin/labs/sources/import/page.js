import {redirect} from "next/navigation";
import Link from "next/link";
import {getCurrentAuthSession} from "@/app/lib/auth/server-session";
import {getLabsOwnerAccessStatus} from "@/app/lib/labs/owner-access";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabRuntimeImportPanel from "@/app/components/labs/admin/LabRuntimeImportPanel";
export const dynamic="force-dynamic",revalidate=0;
export default async function ImportRuntimePage(){
 const session=await getCurrentAuthSession();
 if(!session?.user?.id)redirect("/labs/login?returnTo="+encodeURIComponent("/admin/labs/sources/import"));
 const status=getLabsOwnerAccessStatus(session.user);if(status!=="owner")return <LabsOwnerAccessNotice status={status}/>;
 return <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/admin/labs/sources" className="text-xs text-text-secondary">← Source dashboard</Link><h1 className="mt-8 text-2xl font-semibold">Runtime source initialization</h1><LabRuntimeImportPanel/></div></main>
}