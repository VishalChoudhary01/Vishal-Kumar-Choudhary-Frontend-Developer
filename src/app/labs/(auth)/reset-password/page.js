import ResetPasswordForm from "@/app/components/labs/auth/ResetPasswordForm";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Create a new Labs password",
  robots: { index: false, follow: false },
};

export default async function LabsResetPasswordPage({ searchParams }) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query?.returnTo);

  return (
    <ResetPasswordForm
      token={typeof query?.token === "string" ? query.token : ""}
      returnTo={returnTo}
    />
  );
}
