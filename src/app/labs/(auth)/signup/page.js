import { redirect } from "next/navigation";

import SignupForm from "@/app/components/labs/auth/SignupForm";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getAuthRegistrationReadiness,
  isAuthRuntimeConfigured,
  isGoogleAuthConfigured,
  isGitHubAuthConfigured,
} from "@/app/lib/auth/auth";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Create a Labs account",
  robots: { index: false, follow: false },
};

export default async function LabsSignupPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query?.returnTo);
  const session = await getCurrentAuthSession();

  if (session?.user?.id && session.user.emailVerified) {
    redirect(returnTo);
  }

  const readiness = getAuthRegistrationReadiness();
  const registrationEnabled = Object.values(readiness).every(Boolean);
  const googleEnabled = isAuthRuntimeConfigured() && isGoogleAuthConfigured;
  const githubEnabled = isAuthRuntimeConfigured() && isGitHubAuthConfigured;

  return (
    <SignupForm
      returnTo={returnTo}
      registrationEnabled={registrationEnabled}
      readiness={readiness}
      googleEnabled={googleEnabled}
      githubEnabled={githubEnabled}
      initialError={
        query?.error === "google"
          ? "Google account creation could not be completed. Please try again."
          : query?.error === "github"
            ? "GitHub account creation could not be completed. Make sure your account has a verified email address, then try again."
            : ""
      }
    />
  );
}
