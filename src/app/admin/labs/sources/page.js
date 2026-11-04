import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Eye,
  FileCode2,
  Heart,
  Users,
} from "lucide-react";

import LabSourceInventory from "@/app/components/labs/admin/LabSourceInventory";
import LabsOwnerAccessNotice from "@/app/components/labs/admin/LabsOwnerAccessNotice";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAccessStatus } from "@/app/lib/labs/owner-access";
import { getLabsOwnerAnalytics } from "@/app/lib/labs/owner-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function number(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <article className="border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
          {label}
        </p>
        <Icon size={17} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
        {number(value)}
      </p>
      {detail ? <p className="mt-1 text-xs text-text-tertiary">{detail}</p> : null}
    </article>
  );
}

function formatGeneratedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function LabsSourceAdminPage({ searchParams }) {
  const query = await searchParams;
  const requestedDays = Number(query?.days || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
  const session = await getCurrentAuthSession();

  if (!session?.user?.id) {
    redirect("/labs/login?returnTo=" + encodeURIComponent("/admin/labs/sources"));
  }

  const ownerStatus = getLabsOwnerAccessStatus(session.user);
  if (ownerStatus !== "owner") {
    return <LabsOwnerAccessNotice status={ownerStatus} />;
  }

  let analytics = null;
  try {
    analytics = await getLabsOwnerAnalytics({ user: session.user, days });
  } catch (error) {
    console.error("[labs-owner] analytics unavailable:", error?.code || "ANALYTICS_UNAVAILABLE");
  }

  const totals = analytics?.totals;

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

        <header className="mt-10 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              PRIVATE OWNER AREA
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Source engagement
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              See how published experiment source is opened, copied and liked. Anonymous likes are reported separately from verified-account likes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/labs/sources/import"
              className="inline-flex h-9 items-center gap-2 border border-brand/40 bg-brand-soft/30 px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <FileCode2 size={14} aria-hidden="true" />
              Initialize sources
            </Link>
            {analytics ? (
              <div className="text-xs text-text-tertiary">
                Last {analytics.periodDays} days · Updated {formatGeneratedAt(analytics.generatedAt)}
              </div>
            ) : (
              <span className="border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                Analytics temporarily unavailable
              </span>
            )}
          </div>
        </header>

        {analytics ? (
          <>
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
                    href={"/admin/labs/sources?days=" + period}
                    aria-current={analytics.periodDays === period ? "page" : undefined}
                    className={[
                      "inline-flex h-8 items-center border px-3 text-xs font-medium transition-colors",
                      analytics.periodDays === period
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border text-text-secondary hover:border-brand hover:text-brand",
                    ].join(" ")}
                  >
                    {period} days
                  </Link>
                ))}
              </nav>
            </div>

            <section
              aria-label="Engagement overview"
              className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              <Metric
                icon={Eye}
                label="Source opens"
                value={totals.sourceOpens}
                detail="Successful verified source loads"
              />
              <Metric
                icon={Users}
                label="Verified accounts"
                value={totals.uniqueVerifiedAccounts}
                detail="Per-experiment unique accounts, summed"
              />
              <Metric
                icon={Copy}
                label="Code copies"
                value={totals.codeCopies}
                detail="Reported after clipboard success"
              />
              <Metric
                icon={Heart}
                label="Active likes"
                value={totals.totalActiveLikes}
                detail={
                  number(totals.activeAnonymousLikes) +
                  " anonymous · " +
                  number(totals.activeVerifiedLikes) +
                  " verified"
                }
              />
            </section>

            <section
              aria-labelledby="engagement-trend-title"
              className="mt-8 border border-border bg-surface-1 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="engagement-trend-title" className="text-sm font-semibold">
                    Daily engagement activity
                  </h2>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Successful source opens, copies and like/unlike state changes, in UTC.
                  </p>
                </div>
                <span className="text-xs text-text-tertiary">
                  {analytics.daily.length} active days
                </span>
              </div>

              {analytics.daily.length ? (
                <div className="mt-5 overflow-x-auto">
                  <div
                    className="flex h-36 min-w-[560px] items-end gap-1 border-b border-border pb-2"
                    role="img"
                    aria-label="Daily engagement activity bar chart"
                  >
                    {analytics.daily.map((day) => {
                      const maximum = Math.max(
                        1,
                        ...analytics.daily.map((item) => item.totalActions),
                      );
                      const height = Math.max(3, (day.totalActions / maximum) * 100);

                      return (
                        <div
                          key={day.date}
                          className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                        >
                          <span className="text-[9px] tabular-nums text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100">
                            {number(day.totalActions)}
                          </span>
                          <div
                            className="w-full min-w-[3px] bg-brand/70 transition-colors group-hover:bg-brand"
                            style={{ height: height + "%" }}
                            title={day.date + ": " + day.totalActions + " actions"}
                          />
                          <span className="text-[9px] text-text-tertiary">
                            {new Date(day.date + "T00:00:00Z").toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              timeZone: "UTC",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-5 border border-dashed border-border p-6 text-center text-xs text-text-tertiary">
                  No engagement events have been recorded during this period.
                </p>
              )}
            </section>

            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Experiments</h2>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Current active likes and activity recorded during the selected period.
                  </p>
                </div>
                <span className="text-xs text-text-tertiary">
                  {analytics.experiments.length} published experiments
                </span>
              </div>

              <div className="mt-4 overflow-x-auto border border-border">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-surface-2 text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                    <tr>
                      <th className="px-4 py-3 font-medium">Experiment</th>
                      <th className="px-4 py-3 text-right font-medium">Opens</th>
                      <th className="px-4 py-3 text-right font-medium">Unique verified</th>
                      <th className="px-4 py-3 text-right font-medium">Copies</th>
                      <th className="px-4 py-3 text-right font-medium">Anonymous likes</th>
                      <th className="px-4 py-3 text-right font-medium">Verified likes</th>
                      <th className="px-4 py-3 text-right font-medium">Total active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.experiments.map((experiment) => (
                      <tr key={experiment.slug} className="border-t border-border">
                        <th scope="row" className="px-4 py-4 font-medium text-text-primary">
                          <span className="block">{experiment.title}</span>
                          <span className="mt-1 block text-xs font-normal text-text-tertiary">
                            {experiment.slug}
                          </span>
                        </th>
                        <td className="px-4 py-4 text-right tabular-nums">
                          {number(experiment.sourceOpens)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          {number(experiment.uniqueVerifiedAccounts)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          {number(experiment.codeCopies)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          {number(experiment.activeAnonymousLikes)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          {number(experiment.activeVerifiedLikes)}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold tabular-nums">
                          {number(experiment.totalActiveLikes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 grid gap-3 sm:grid-cols-2">
              <article className="border border-border p-5">
                <h2 className="text-sm font-semibold">Like activity</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-tertiary">Verified like / unlike</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {number(totals.verifiedLikeActions)} / {number(totals.verifiedUnlikeActions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Anonymous like / unlike</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {number(totals.anonymousLikeActions)} / {number(totals.anonymousUnlikeActions)}
                    </p>
                  </div>
                </div>
              </article>
              <article className="border border-border p-5">
                <h2 className="text-sm font-semibold">Anonymous measurement</h2>
                <p className="mt-2 text-xs leading-6 text-text-secondary">
                  Anonymous totals represent active browser identities and recorded actions, not verified people. Clearing cookies, changing browsers or using another device may create another anonymous identity.
                </p>
              </article>
            </section>
          </>
        ) : (
          <section role="alert" className="mt-7 border border-warning/40 bg-warning/10 p-5">
            <h2 className="text-sm font-semibold text-warning">
              Engagement analytics could not be loaded
            </h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              The owner session is valid, but the analytics service could not read MongoDB. Confirm the Preview database connection and check the deployment function logs. The source inventory below can still load independently.
            </p>
          </section>
        )}

        <LabSourceInventory />
      </div>
    </main>
  );
}
