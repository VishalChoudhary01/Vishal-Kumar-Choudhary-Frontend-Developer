import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Copy, Eye, Heart, Users } from "lucide-react";
import AdminBreadcrumbs from "@/app/components/labs/admin/AdminBreadcrumbs";
import LabsEngagementTrendChart from "@/app/components/labs/admin/LabsEngagementTrendChart";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { toLabsAccountUser } from "@/app/lib/labs/auth-user-presentation.mjs";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import {
  getLabsOwnerActiveVerifiedLikes,
  getLabsOwnerExperimentAnalytics,
} from "@/app/lib/labs/owner-analytics";

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

function maskEmail(value) {
  if (typeof value !== "string" || !value.includes("@")) return "Email unavailable";
  const [local, ...domainParts] = value.split("@");
  const domain = domainParts.join("@");
  if (!local || !domain) return "Email unavailable";
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return visible + "•••@" + domain;
}

function formatLikedAt(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default async function LabsExperimentAnalyticsPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const requestedDays = Number(query?.days || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
  const likerSearch = typeof query?.userSearch === "string" ? query.userSearch.slice(0, 80) : "";
  const requestedLikerPage = Number(query?.likerPage || 1);
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
  let activeVerifiedLikes = null;
  let activeVerifiedLikesError = "";
  try {
    analytics = await getLabsOwnerExperimentAnalytics({ user: session.user, slug, days });
  } catch (error) {
    if (error?.code === "NOT_FOUND") notFound();
    console.error("[labs-owner] experiment analytics unavailable:", error?.code || "ANALYTICS_UNAVAILABLE");
  }

  if (analytics) {
    try {
      activeVerifiedLikes = await getLabsOwnerActiveVerifiedLikes({
        user: session.user,
        slug,
        page: requestedLikerPage,
        search: likerSearch,
      });
    } catch (error) {
      activeVerifiedLikesError = "The current verified-like list could not be loaded. Aggregate like totals above remain available.";
      console.error("[labs-owner] active verified liker list unavailable:", error?.code || "LIKER_LIST_UNAVAILABLE");
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <AdminBreadcrumbs items={[
          { href: "/admin/labs/analytics", label: "All analytics" },
          { label: analytics?.experiment.title || "Experiment analytics" },
        ]} />
        <LabsOwnerNavigation active="analytics" user={toLabsAccountUser(session.user)} />

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
            <section aria-label="Experiment engagement overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric icon={Eye} label="Source opens" value={analytics.experiment.sourceOpens} detail="Successful verified source loads in this period" />
              <Metric icon={Users} label="Verified accounts" value={analytics.experiment.uniqueVerifiedAccounts} detail="Distinct accounts for this experiment in this period" />
              <Metric icon={Copy} label="File copies" value={analytics.experiment.codeCopies} detail="Individual files copied after clipboard success" />
              <Metric icon={Copy} label="Component copies" value={analytics.experiment.componentCopies} detail="Complete published source bundles copied once per account and version" />
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold">Verified accounts currently liking this experiment</h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
                    Current active account likes, not a history of every click. Anonymous visitors are intentionally shown only in the aggregate count above.
                  </p>
                </div>
                {activeVerifiedLikes ? (
                  <p className="text-sm font-semibold tabular-nums text-text-primary">
                    {number(activeVerifiedLikes.total)} accounts
                  </p>
                ) : null}
              </div>

              <form method="GET" action={returnTo} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="days" value={days} />
                <input
                  type="search"
                  name="userSearch"
                  defaultValue={activeVerifiedLikes?.search || likerSearch}
                  maxLength={80}
                  placeholder="Search name or email"
                  aria-label="Search verified likers by name or email"
                  className="h-9 min-w-0 flex-1 border border-border bg-background px-3 text-xs text-text-primary outline-none focus:border-brand sm:max-w-sm"
                />
                <button type="submit" className="h-9 border border-border px-3 text-xs font-semibold text-text-secondary hover:border-brand hover:text-brand">
                  Search
                </button>
                {likerSearch ? (
                  <Link href={returnTo + "?days=" + days} className="text-xs text-text-tertiary hover:text-text-primary">
                    Clear
                  </Link>
                ) : null}
              </form>

              {activeVerifiedLikesError ? (
                <p role="alert" className="mt-4 border border-warning/40 bg-warning/10 px-4 py-4 text-xs text-warning">
                  {activeVerifiedLikesError}
                </p>
              ) : activeVerifiedLikes?.items?.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="border-y border-border text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
                      <tr>
                        <th scope="col" className="py-3 pr-4 font-medium">Account</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Email</th>
                        <th scope="col" className="py-3 font-medium">Liked at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeVerifiedLikes.items.map((item, index) => (
                        <tr key={item.email + "-" + item.likedAt + "-" + index}>
                          <td className="py-3 pr-4 font-medium text-text-primary">{item.name}</td>
                          <td className="py-3 pr-4 text-text-secondary">{maskEmail(item.email)}</td>
                          <td className="py-3 tabular-nums text-text-secondary">{formatLikedAt(item.likedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeVerifiedLikes ? (
                <p className="mt-4 border border-dashed border-border px-4 py-6 text-center text-xs text-text-tertiary">
                  {likerSearch
                    ? "No active verified likes match this search."
                    : "No verified accounts currently like this experiment."}
                </p>
              ) : null}

              {activeVerifiedLikes && activeVerifiedLikes.pages > 1 ? (
                <nav aria-label="Verified liker pages" className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-[10px] text-text-tertiary">
                    Page {activeVerifiedLikes.page} of {activeVerifiedLikes.pages}
                  </p>
                  <div className="flex items-center gap-2">
                    {activeVerifiedLikes.page > 1 ? (
                      <Link
                        href={returnTo + "?days=" + days + "&userSearch=" + encodeURIComponent(likerSearch) + "&likerPage=" + (activeVerifiedLikes.page - 1)}
                        className="inline-flex h-8 items-center border border-border px-3 text-[10px] font-medium hover:border-brand hover:text-brand"
                      >
                        Previous
                      </Link>
                    ) : null}
                    {activeVerifiedLikes.page < activeVerifiedLikes.pages ? (
                      <Link
                        href={returnTo + "?days=" + days + "&userSearch=" + encodeURIComponent(likerSearch) + "&likerPage=" + (activeVerifiedLikes.page + 1)}
                        className="inline-flex h-8 items-center border border-border px-3 text-[10px] font-medium hover:border-brand hover:text-brand"
                      >
                        Next
                      </Link>
                    ) : null}
                  </div>
                </nav>
              ) : null}
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
