import VerifyEmailPanel from "@/app/components/labs/auth/VerifyEmailPanel";
import { isAuthDeliveryConfigured } from "@/app/lib/auth/auth";
import { getVerificationFlowStatus } from "@/app/lib/auth/verification-flows";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Verify your Labs email",
  robots: { index: false, follow: false },
};

export default async function LabsVerifyEmailPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query?.returnTo);
  const flow = typeof query?.flow === "string" ? query.flow : "";
  const hasError = typeof query?.error === "string" && query.error.length > 0;
  const verified =
    !hasError &&
    Boolean(flow) &&
    (await getVerificationFlowStatus(flow).catch(() => false));

  return (
    <VerifyEmailPanel
      verified={verified}
      invalid={hasError || (query?.verified === "1" && !verified)}
      emailDeliveryEnabled={isAuthDeliveryConfigured()}
      returnTo={returnTo}
      flow={flow}
    />
  );
}
