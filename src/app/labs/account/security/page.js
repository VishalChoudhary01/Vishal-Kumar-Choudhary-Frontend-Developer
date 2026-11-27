import { redirect } from "next/navigation";

import LabsAccountSecurity from "@/app/components/labs/LabsAccountSecurity";
import Navbar from "@/app/components/layout/Navbar";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import AuthMessage from "@/app/components/labs/auth/AuthMessage";
import {
  isAuthRuntimeConfigured,
  isGoogleAuthConfigured,
  isGitHubAuthConfigured,
} from "@/app/lib/auth/auth";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Account settings | Portfolio Labs",
  robots: { index: false, follow: false },
};

export default async function LabsAccountSecurityPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = "/labs/account/security";

  if (!isAuthRuntimeConfigured()) {
    return (
      <main className="mx-auto w-full max-w-[760px] px-4 py-12 sm:px-6">
        <AuthMessage title="Account settings unavailable">
          Authentication is temporarily unavailable. Please try again later.
        </AuthMessage>
      </main>
    );
  }

  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent(returnTo));
  }

  if (session.user.emailVerified !== true) {
    redirect("/labs/verify-email?returnTo=" + encodeURIComponent(returnTo));
  }

  const linkedProvider = ["google", "github"].includes(query?.linked) ? query.linked : "";
  const initialNotice = query?.linkError
    ? "The provider could not be connected. Check that it uses the same verified email as your Labs account."
    : "";

  return (
    <>
      <Navbar
        context="project"
        solidScrolledSurface
        showLabsAccount
        hideSocialLinks
        initialAuthUser={toLabsAccountUser(session.user)}
        initialSessionResolved
        initialIsOwner={getLabsOwnerAccessStatus(session.user) === "owner"}
      />
      <LabsAccountSecurity
        email={session.user.email}
        googleEnabled={isGoogleAuthConfigured}
        githubEnabled={isGitHubAuthConfigured}
        initialNotice={initialNotice}
        linkedProvider={linkedProvider}
      />
    </>
  );
}
