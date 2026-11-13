import { notFound } from "next/navigation";

import AdminBreadcrumbs from "@/app/components/labs/admin/AdminBreadcrumbs";
import PortfolioAnalyticsDashboard from "@/app/components/portfolio-analytics/PortfolioAnalyticsDashboard";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";
import {
  getPortfolioAnalyticsReport,
  getPortfolioRecentVisits,
} from "@/app/lib/portfolio-analytics/report-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Portfolio Analytics — Private Owner Area",
  robots: { index: false, follow: false },
};

const ALLOWED_PERIODS = [7, 30, 60];

function normalizeDays(value) {
  const days = Number(value);
  return ALLOWED_PERIODS.includes(days) ? days : 30;
}

export default async function PortfolioAnalyticsPage({ searchParams }) {
  let session = null;

  try {
    session = await getCurrentAuthSession();
  } catch {
    notFound();
  }

  if (!isLabsOwner(session?.user)) notFound();

  const query = await searchParams;
  const days = normalizeDays(query?.days);
  const cursor = typeof query?.cursor === "string" ? query.cursor : null;

  let report = null;
  let reportError = "";
  let recent = null;
  let recentError = "";

  try {
    report = await getPortfolioAnalyticsReport({ days, excludedOwnerUser: session.user });
  } catch (error) {
    reportError = "Analytics summary is temporarily unavailable.";
    console.error("[portfolio-analytics] report unavailable:", error?.code || "REPORT_UNAVAILABLE");
  }

  try {
    recent = await getPortfolioRecentVisits({ days, cursor, limit: 25, excludedOwnerUser: session.user });
  } catch (error) {
    recentError = "Recent visits could not be loaded. Check the database indexes and try again.";
    console.error("[portfolio-analytics] recent visits unavailable:", error?.code || "RECENT_VISITS_UNAVAILABLE");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <AdminBreadcrumbs items={[{ href: "/admin/labs/analytics", label: "Back to Labs analytics" }]} />

        <LabsOwnerNavigation active="portfolio-analytics" user={toLabsAccountUser(session.user)} />

        <header className="mt-8 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">PRIVATE OWNER AREA</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Understand how visitors reach and explore your homepage, projects and Labs.
            </p>
          </div>
        </header>

        <PortfolioAnalyticsDashboard
          key={days + ":" + (cursor || "first")}
          report={report}
          recentVisits={recent?.visits || []}
          nextCursor={recent?.nextCursor || null}
          days={days}
          cursor={cursor}
          reportError={reportError}
          recentError={recentError}
        />
      </div>
    </main>
  );
}
