import { redirect } from "next/navigation";

import SignupForm from "@/app/components/labs/auth/SignupForm";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  isAuthDeliveryConfigured,
  isAuthRuntimeConfigured,
  isLegalConsentConfigured,
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

  const legal = {
    termsUrl: process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_URL || "",
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || "",
  };

  const registrationEnabled =
    isAuthRuntimeConfigured() &&
    isAuthDeliveryConfigured() &&
    isLegalConsentConfigured();

  return (
    <SignupForm
      returnTo={returnTo}
      legal={legal}
      registrationEnabled={registrationEnabled}
    />
  );
}
