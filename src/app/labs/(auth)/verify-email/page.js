import VerifyEmailPanel from "@/app/components/labs/auth/VerifyEmailPanel";
import { isAuthDeliveryConfigured } from "@/app/lib/auth/auth";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Verify your Labs email",
  robots: { index: false, follow: false },
};

export default async function LabsVerifyEmailPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query?.returnTo);

  return (
    <VerifyEmailPanel
      verified={query?.verified === "1" && !query?.error}
      invalid={String(query?.error || "").toLowerCase() === "invalid_token"}
      emailDeliveryEnabled={isAuthDeliveryConfigured()}
      returnTo={returnTo}
    />
  );
}
