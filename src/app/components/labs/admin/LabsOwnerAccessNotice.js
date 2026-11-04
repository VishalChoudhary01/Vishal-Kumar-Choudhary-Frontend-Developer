import Link from "next/link";
import { AlertTriangle, ArrowLeft, MailCheck, ShieldAlert } from "lucide-react";

const COPY = {
  "not-configured": {
    title: "Owner access is not configured",
    description:
      "This deployment does not have LABS_OWNER_USER_ID available. Add either the owner's stable Better Auth user ID as LABS_OWNER_USER_ID or the verified email as LABS_OWNER_EMAIL to the Preview environment for feat/labs-platform-integration, then create a new deployment.",
    icon: AlertTriangle,
  },
  "account-mismatch": {
    title: "This account is not the configured Labs owner",
    description:
      "You are signed in, but this account does not match the configured Labs owner. Set LABS_OWNER_USER_ID to the stable Better Auth user ID, or set LABS_OWNER_EMAIL to this verified email address, in the integration branch's Preview environment. Then redeploy.",
    icon: ShieldAlert,
  },
  "email-unverified": {
    title: "Verify your email address",
    description:
      "The owner account must have a verified email address before the source-management workspace can be opened.",
    icon: MailCheck,
  },
};

export default function LabsOwnerAccessNotice({ status }) {
  const config = COPY[status] || COPY["account-mismatch"];
  const Icon = config.icon;

  return (
    <main className="grid min-h-[75svh] place-items-center bg-background px-5 py-12 text-text-primary sm:px-8">
      <section className="w-full max-w-xl border border-border bg-surface-1 p-6 sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center border border-warning/40 bg-warning/10 text-warning">
          <Icon size={18} aria-hidden="true" />
        </div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
          LABS OWNER ACCESS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{config.title}</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{config.description}</p>

        {status === "email-unverified" ? (
          <Link
            href={"/labs/verify-email?returnTo=" + encodeURIComponent("/admin/labs/sources")}
            className="mt-6 inline-flex h-10 items-center justify-center bg-brand px-4 text-xs font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Verify email
          </Link>
        ) : (
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-10 items-center justify-center border border-border px-4 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open Vercel settings
          </a>
        )}

        <Link
          href="/labs"
          className="mt-6 flex w-fit items-center gap-2 text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Back to Labs
        </Link>
      </section>
    </main>
  );
}
