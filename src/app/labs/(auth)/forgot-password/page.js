import ForgotPasswordForm from "@/app/components/labs/auth/ForgotPasswordForm";
import { isAuthDeliveryConfigured } from "@/app/lib/auth/auth";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reset your Labs password",
  robots: { index: false, follow: false },
};

export default async function LabsForgotPasswordPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query?.returnTo);

  return (
    <ForgotPasswordForm
      returnTo={returnTo}
      emailDeliveryEnabled={isAuthDeliveryConfigured()}
    />
  );
}
