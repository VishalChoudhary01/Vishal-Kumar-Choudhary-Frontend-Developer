import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Copy, Eye, Heart, Users } from "lucide-react";
import LabsEngagementTrendChart from "@/app/components/labs/admin/LabsEngagementTrendChart";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import { getLabsOwnerExperimentAnalytics } from "@/app/lib/labs/owner-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function number(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <article className="border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">{label}</p>
        <Icon size={17} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">{number(value)}</p>
      {detail ? <p className="mt-1 text-xs text-text-tertiary">{detail}</p> : null}
    </article>
  );
}

export default async function LabsExperimentAnalyticsPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const requestedDays = Number(query?.days || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
  const returnTo = "/admin/labs/analytics/" + encodeURIComponent(slug);
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent(returnTo));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return <LabsOwnerAccessNotice status={ownerStatus} returnTo={returnTo} />;
  }

  let analytics = null;
  try {
    analytics = await getLabsOwnerExperimentAnalytics({ user: session.user, slug, days });
  } catch (error) {
    if (error?.code === "NOT_FOUND") notFound();
    console.error("[labs-owner] experiment analytics unavailable:", error?.code || "ANALYTICS_UNAVAILABLE");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link href="/admin/labs/analytics" className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary">
          <ArrowLeft size={14} aria-hidden="true" /> All analytics
        </Link>
        <LabsOwnerNavigation active="analytics" />

        <header className="mt-8 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">EXPERIMENT ANALYTICS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{analytics?.experiment.title || "Experiment analytics"}</h1>
          <p className="mt-2 font-mono text-xs text-text-secondary">{slug}</p>
        </header>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">Opens, copies and like actions use the selected UTC date window. Active likes are current state.</p>
          <nav aria-label="Experiment reporting period" className="flex flex-wrap gap-1.5">
            {[7, 30, 90, 365].map((period) => (
              <Link key={period} href={returnTo + "?days=" + period} aria-current={days === period ? "page" : undefined}
                className={["inline-flex h-8 items-center border px-3 text-xs font-medium", days === period ? "border-brand bg-brand-soft text-brand" : "border-border text-text-secondary hover:border-brand hover:text-brand"].join(" ")}>
                {period} days
              </Link>
            ))}
          </nav>
        </div>

        {analytics ? (
          <>
            <section aria-label="Experiment engagement overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Eye} label="Source opens" value={analytics.experiment.sourceOpens} detail="Successful verified source loads in this period" />
              <Metric icon={Users} label="Verified accounts" value={analytics.experiment.uniqueVerifiedAccounts} detail="Distinct accounts for this experiment in this period" />
              <Metric icon={Copy} label="Code copies" value={analytics.experiment.codeCopies} detail="Reported after clipboard success" />
              <Metric icon={Heart} label="Active likes" value={analytics.experiment.totalActiveLikes} detail={number(analytics.experiment.activeAnonymousLikes) + " anonymous · " + number(analytics.experiment.activeVerifiedLikes) + " verified · current state"} />
            </section>

            <LabsEngagementTrendChart
              daily={analytics.daily}
              periodDays={days}
            />

            <section className="mt-8 grid gap-3 sm:grid-cols-2">
              <article className="border border-border bg-surface-1 p-5">
                <h2 className="text-sm font-semibold">Verified like activity</h2>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{number(analytics.experiment.verifiedLikeActions)} / {number(analytics.experiment.verifiedUnlikeActions)}</p>
                <p className="mt-1 text-xs text-text-tertiary">Like actions / unlike actions in the selected period</p>
              </article>
              <article className="border border-border bg-surface-1 p-5">
                <h2 className="text-sm font-semibold">Anonymous like activity</h2>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{number(analytics.experiment.anonymousLikeActions)} / {number(analytics.experiment.anonymousUnlikeActions)}</p>
                <p className="mt-1 text-xs text-text-tertiary">Best-effort anonymous actions, not unique people</p>
              </article>
            </section>

            <section className="mt-8 border border-border bg-surface-1 p-5">
              <h2 className="text-sm font-semibold">Measurement notes</h2>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-text-secondary">
                <li>Source opens and copies are protected-source events, not public experiment detail views.</li>
                <li>Verified accounts are distinct accounts for this experiment, not unique people across Labs.</li>
                <li>Active likes are current persisted state and are not limited to the selected reporting period.</li>
                <li>Public experiment views and preview starts are omitted because those events are not instrumented.</li>
              </ul>
              <p className="mt-4 text-[11px] text-text-tertiary">
                Generated {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(analytics.generatedAt))}. Daily buckets use UTC.
              </p>
            </section>
          </>
        ) : (
          <section role="alert" className="mt-7 border border-warning/40 bg-warning/10 p-5">
            <h2 className="text-sm font-semibold text-warning">Experiment analytics unavailable</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">The owner session is valid, but experiment analytics could not be loaded. Try the collection overview again or inspect the Preview database connection.</p>
            <Link href="/admin/labs/analytics" className="mt-4 inline-flex text-xs font-semibold text-brand hover:underline">Return to all analytics</Link>
          </section>
        )}
      </div>
    </main>
  );
}
