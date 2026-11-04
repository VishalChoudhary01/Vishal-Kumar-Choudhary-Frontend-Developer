import { redirect } from "next/navigation";

import LoginForm from "@/app/components/labs/auth/LoginForm";
import AuthMessage from "@/app/components/labs/auth/AuthMessage";
import {
  isAuthRuntimeConfigured,
  isGoogleAuthConfigured,
} from "@/app/lib/auth/auth";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getSafeOwnerReturnTo, getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in to Labs",
  robots: { index: false, follow: false },
};

export default async function LabsLoginPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeOwnerReturnTo(query?.returnTo) || getSafeReturnTo(query?.returnTo);
  const session = await getCurrentAuthSession();

  if (session?.user?.id && session.user.emailVerified) {
    redirect(returnTo);
  }

  const initialError =
    query?.error === "session-expired"
      ? "Your session has expired. Please sign in again to continue."
      : query?.error === "google"
        ? "Google sign-in could not be completed. Please try again."
        : !isAuthRuntimeConfigured()
          ? "Authentication is not configured yet."
          : "";

  return (
    <>
      {initialError ? (
        <AuthMessage title={query?.error === "session-expired" ? "Session expired" : "Authentication unavailable"}>
          {initialError}
        </AuthMessage>
      ) : null}
      <LoginForm
        returnTo={returnTo}
        googleEnabled={isAuthRuntimeConfigured() && isGoogleAuthConfigured}
      />
    </>
  );
}
