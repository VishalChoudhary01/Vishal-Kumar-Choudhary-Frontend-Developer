import { redirect } from "next/navigation";

import SignupForm from "@/app/components/labs/auth/SignupForm";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getAuthRegistrationReadiness,
} from "@/app/lib/auth/auth";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";
import { getLegalDocumentConfig } from "@/app/lib/legal/policies";

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

  const legalDocuments = getLegalDocumentConfig();
  const legal = {
    termsUrl: legalDocuments.terms.url,
    privacyUrl: legalDocuments.privacy.url,
  };

  const readiness = getAuthRegistrationReadiness();
  const registrationEnabled = Object.values(readiness).every(Boolean);

  return (
    <SignupForm
      returnTo={returnTo}
      legal={legal}
      registrationEnabled={registrationEnabled}
      readiness={readiness}
    />
  );
}
