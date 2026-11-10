import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import LabsLiveAnalyticsDashboard from "@/app/components/labs/admin/LabsLiveAnalyticsDashboard";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import { getLabsOwnerAnalytics } from "@/app/lib/labs/owner-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LabsAnalyticsPage({ searchParams }) {
  const query = await searchParams;
  const requestedDays = Number(query?.days || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/analytics"));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return <LabsOwnerAccessNotice status={ownerStatus} returnTo="/admin/labs/analytics" />;
  }

  let analytics = null;
  try {
    analytics = await getLabsOwnerAnalytics({ user: session.user, days });
  } catch (error) {
    console.error("[labs-owner] analytics unavailable:", error?.code || "ANALYTICS_UNAVAILABLE");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/labs"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Labs
        </Link>

        <LabsOwnerNavigation active="analytics" user={toLabsAccountUser(session.user)} />

        <header className="mt-8 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              PRIVATE OWNER AREA
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Labs analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Monitor published experiment source opens, successful code copies and like activity. Anonymous and verified engagement remain separately identified.
            </p>
          </div>

        </header>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Reporting period
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Choose the window used for opens, copies and like activity.
            </p>
          </div>
          <nav aria-label="Analytics reporting period" className="flex flex-wrap gap-1.5">
            {[7, 30, 90, 365].map((period) => (
              <Link
                key={period}
                href={"/admin/labs/analytics?days=" + period}
                aria-current={days === period ? "page" : undefined}
                className={[
                  "inline-flex h-8 items-center border px-3 text-xs font-medium transition-colors",
                  days === period
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border text-text-secondary hover:border-brand hover:text-brand",
                ].join(" ")}
              >
                {period} days
              </Link>
            ))}
          </nav>
        </div>

        <LabsLiveAnalyticsDashboard
          key={days}
          initialAnalytics={analytics}
          days={days}
        />
      </div>
    </main>
  );
}
