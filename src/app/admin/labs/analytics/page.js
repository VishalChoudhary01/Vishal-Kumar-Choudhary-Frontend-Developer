import { redirect } from "next/navigation";
import Link from "next/link";

import AdminBreadcrumbs from "@/app/components/labs/admin/AdminBreadcrumbs";
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
        <AdminBreadcrumbs items={[{ href: "/labs", label: "Back to Labs" }]} />

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
          <nav aria-label="Analytics reporting period" className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-[3px] border border-border bg-surface-1/80 p-1.5 shadow-sm">
            {[7, 30, 90, 365].map((period) => (
              <Link
                key={period}
                href={"/admin/labs/analytics?days=" + period}
                aria-current={days === period ? "page" : undefined}
                className={[
                  "inline-flex min-h-9 items-center justify-center rounded-[2px] border px-3.5 text-xs font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none sm:px-4",
                  days === period
                    ? "border-brand/40 bg-brand-soft text-brand shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-brand/15"
                    : "border-transparent text-text-secondary hover:-translate-y-0.5 hover:border-border hover:bg-surface-2 hover:text-text-primary hover:shadow-sm active:scale-[0.98]",
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
