"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { CopyCheckIcon } from "@animateicons/react/lucide/copy-check-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import { HeartPulseIcon } from "@animateicons/react/lucide/heart-pulse-icon";
import { TrashIcon as AnimatedTrash } from "@animateicons/react/lucide/trash-icon";
import { UserRoundCheckIcon } from "@animateicons/react/lucide/user-round-check-icon";
import { RefreshCwIcon as AnimatedRefreshCw } from "@animateicons/react/lucide/refresh-cw-icon";
import { RotateCcwIcon as AnimatedRotateCcw } from "@animateicons/react/lucide/rotate-ccw-icon";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import {
  RefreshCw,
  X,
} from "lucide-react";

import MotionNumber from "@/app/components/motion/MotionNumber/MotionNumber";
import LabsEngagementTrendChart from "./LabsEngagementTrendChart";

const POLL_INTERVAL = 10_000;
const MAX_BACKOFF = 60_000;

function number(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function formatUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function MetricCard({ icon: Icon, label, value, detail }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <article className="rounded-[3px] border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
          {label}
        </p>
        <Icon size={17} duration={0.72} isAnimated={!prefersReducedMotion} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <div className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
        <MotionNumber
          value={value}
          locale="en-IN"
          ariaLabel={label + ": " + number(value)}
          duration={0.38}
        />
      </div>
      {detail ? <p className="mt-1 text-xs text-text-tertiary">{detail}</p> : null}
    </article>
  );
}

function RankingCard({ title, description, items, valueSuffix = "" }) {
  return (
    <article className="rounded-[3px] border border-border bg-surface-1 p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">{description}</p>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
              <div className="flex min-w-0 items-start gap-3">
                <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-text-tertiary">{item.rank}.</span>
                <Link
                  href={"/admin/labs/analytics/" + encodeURIComponent(item.slug)}
                  className="min-w-0 text-xs font-medium text-text-primary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="block truncate">{item.title}</span>
                  <span className="mt-1 block truncate font-mono text-[10px] font-normal text-text-tertiary">{item.slug}</span>
                </Link>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                {number(item.value)}{valueSuffix}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 border border-dashed border-border px-3 py-4 text-xs text-text-tertiary">
          No recorded activity in this ranking yet.
        </p>
      )}
    </article>
  );
}

function LoadingMetrics() {
  return (
    <section aria-label="Loading engagement overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="rounded-[3px] min-h-32 border border-border bg-surface-1 p-5" aria-hidden="true">
          <div className="h-3 w-28 animate-pulse bg-surface-2 motion-reduce:animate-none" />
          <div className="mt-5 h-8 w-24 animate-pulse bg-surface-2 motion-reduce:animate-none" />
          <div className="mt-3 h-2.5 w-36 animate-pulse bg-surface-2 motion-reduce:animate-none" />
        </div>
      ))}
      <p className="sr-only" role="status">Loading analytics data.</p>
    </section>
  );
}

export default function LabsLiveAnalyticsDashboard({ initialAnalytics, days }) {
  const prefersReducedMotion = useReducedMotion();
  const [analytics, setAnalytics] = useState(initialAnalytics || null);
  const [lastUpdated, setLastUpdated] = useState(initialAnalytics?.generatedAt || null);
  const [refreshError, setRefreshError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeConfirmation, setRemoveConfirmation] = useState("");
  const [analyticsMutationError, setAnalyticsMutationError] = useState("");
  const [mutatingSlug, setMutatingSlug] = useState("");

  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const inFlightRef = useRef(false);
  const failureCountRef = useRef(0);
  const refreshRef = useRef(null);
  const scheduleRef = useRef(null);
  const removeDialogIconRef = useRef(null);
  const refreshIconRef = useRef(null);
  const removeConfirmIconRef = useRef(null);
  const removeRowIconRefs = useRef(new Map());
  const restoreIconRefs = useRef(new Map());

  useEffect(() => {
    if (removeTarget) removeDialogIconRef.current?.startAnimation?.();
  }, [removeTarget]);

  const scheduleRefresh = useCallback((delay) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      refreshRef.current?.();
    }, delay);
  }, []);

  const refreshAnalytics = useCallback(async () => {
    if (inFlightRef.current || document.visibilityState !== "visible") return;

    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setRefreshing(true);

    try {
      const response = await fetch("/api/v1/admin/labs/analytics?days=" + days, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.data?.generatedAt || !payload?.data?.totals) {
        throw new Error(payload?.error?.message || "Analytics could not be refreshed.");
      }

      setAnalytics(payload.data);
      setLastUpdated(payload.data.generatedAt);
      setRefreshError("");
      failureCountRef.current = 0;
    } catch (reason) {
      if (reason?.name !== "AbortError") {
        failureCountRef.current += 1;
        setRefreshError(reason?.message || "Analytics could not be refreshed.");
      }
    } finally {
      inFlightRef.current = false;
      if (abortRef.current === controller) abortRef.current = null;
      setRefreshing(false);

      if (document.visibilityState === "visible") {
        const delay = failureCountRef.current
          ? Math.min(POLL_INTERVAL * (2 ** failureCountRef.current), MAX_BACKOFF)
          : POLL_INTERVAL;
        scheduleRef.current?.(delay);
      }
    }
  }, [days]);

  useEffect(() => {
    refreshRef.current = refreshAnalytics;
    scheduleRef.current = scheduleRefresh;

    if (initialAnalytics) {
      scheduleRefresh(POLL_INTERVAL);
    } else {
      refreshAnalytics();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(timerRef.current);
        abortRef.current?.abort();
        return;
      }

      scheduleRefresh(0);
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") scheduleRefresh(0);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearTimeout(timerRef.current);
      abortRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      refreshRef.current = null;
      scheduleRef.current = null;
    };
  }, [initialAnalytics, refreshAnalytics, scheduleRefresh]);

  function refreshNow() {
    window.clearTimeout(timerRef.current);
    failureCountRef.current = 0;
    refreshRef.current?.();
  }

  async function removeExperimentFromAnalytics() {
    if (!removeTarget || removeConfirmation.trim() !== removeTarget.slug) return;

    const slug = removeTarget.slug;
    setMutatingSlug(slug);
    setAnalyticsMutationError("");

    try {
      const response = await fetch(
        "/api/v1/admin/labs/analytics/" + encodeURIComponent(slug),
        {
          method: "DELETE",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.data?.hidden !== true) {
        throw new Error(payload?.error?.message || "The experiment could not be removed from analytics.");
      }

      setRemoveTarget(null);
      setRemoveConfirmation("");
      await refreshRef.current?.();
    } catch (reason) {
      setAnalyticsMutationError(reason?.message || "The experiment could not be removed from analytics.");
    } finally {
      setMutatingSlug("");
    }
  }

  async function restoreExperimentAnalytics(slug) {
    setMutatingSlug("restore:" + slug);
    setAnalyticsMutationError("");

    try {
      const response = await fetch(
        "/api/v1/admin/labs/analytics/" + encodeURIComponent(slug),
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.data?.restored !== true) {
        throw new Error(payload?.error?.message || "The experiment could not be restored.");
      }

      await refreshRef.current?.();
    } catch (reason) {
      setAnalyticsMutationError(reason?.message || "The experiment could not be restored.");
    } finally {
      setMutatingSlug("");
    }
  }

  if (!analytics) {
    return (
      <section className="rounded-[3px] mt-7 border border-border bg-surface-1 p-6">
        {refreshError ? (
          <>
            <h2 className="text-sm font-semibold text-warning">Analytics could not be loaded</h2>
            <p role="alert" className="mt-2 text-xs leading-5 text-text-secondary">
              {refreshError} The dashboard will retry automatically while this tab is visible.
            </p>
            <button
              type="button"
              onClick={refreshNow}
              disabled={refreshing}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-semibold text-text-secondary transition-[color,background-color,border-color] duration-200 hover:border-brand/45 hover:bg-surface-2 hover:text-brand disabled:opacity-50 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Try again
            </button>
          </>
        ) : (
          <p className="text-xs text-text-tertiary" role="status">
            Loading engagement analytics…
          </p>
        )}
        <LoadingMetrics />
      </section>
    );
  }

  const totals = analytics.totals;

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Auto-refresh every 10 seconds while visible
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Last successful update:{" "}
            <time dateTime={lastUpdated || analytics.generatedAt}>
              {formatUpdatedAt(lastUpdated || analytics.generatedAt)}
            </time>
          </span>
          {refreshing ? <span>Refreshing…</span> : null}
        </div>

        <button
          type="button"
          onClick={refreshNow}
          disabled={refreshing}
          onMouseEnter={() => refreshIconRef.current?.startAnimation?.()}
          onMouseLeave={() => refreshIconRef.current?.stopAnimation?.()}
          onFocus={() => refreshIconRef.current?.startAnimation?.()}
          onBlur={() => refreshIconRef.current?.stopAnimation?.()}
          className="inline-flex h-8 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-medium text-text-secondary transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:text-brand hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <AnimatedRefreshCw ref={refreshIconRef} size={13} duration={0.68} isAnimated={!prefersReducedMotion} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          Refresh now
        </button>
      </div>

      {refreshError ? (
        <div className="rounded-[2px] mt-3 flex flex-wrap items-center justify-between gap-3 border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning" role="status">
          <span>
            Refresh failed. Showing the last successful data. {refreshError}
          </span>
          <button type="button" onClick={refreshNow} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      ) : null}

      <section
        aria-label="Engagement overview"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          icon={EyeIcon}
          label="Source opens"
          value={totals.sourceOpens}
          detail="Successful verified source loads"
        />
        <MetricCard
          icon={UserRoundCheckIcon}
          label="Verified accounts"
          value={totals.uniqueVerifiedAccounts}
          detail="Per-experiment unique accounts, summed"
        />
        <MetricCard
          icon={CopyCheckIcon}
          label="Code copies"
          value={totals.codeCopies}
          detail="Reported after clipboard success"
        />
        <MetricCard
          icon={HeartPulseIcon}
          label="Active likes"
          value={totals.totalActiveLikes}
          detail={number(totals.activeAnonymousLikes) + " anonymous · " + number(totals.activeVerifiedLikes) + " verified"}
        />
      </section>

      <LabsEngagementTrendChart
        daily={analytics.daily}
        periodDays={days}
        isRefreshing={refreshing}
      />

      <section aria-labelledby="experiment-rankings-title" className="mt-10">
        <div>
          <h2 id="experiment-rankings-title" className="text-lg font-semibold">Experiment rankings</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Opens and copies use the selected period. Active likes show the current persisted state.
          </p>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          <RankingCard
            title="Most source opens"
            description="Successful verified source loads during this period."
            items={analytics.rankings?.mostSourceOpens || []}
          />
          <RankingCard
            title="Most code copies"
            description="Clipboard-success reports accepted during this period."
            items={analytics.rankings?.mostCodeCopies || []}
          />
          <RankingCard
            title="Most active likes"
            description="Current active likes; not limited to the reporting period."
            items={analytics.rankings?.mostActiveLikes || []}
          />
        </div>
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

        <div className="mt-4 overflow-x-auto rounded-[3px] border border-border">
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
                <th className="px-4 py-3 text-right font-medium">Manage</th>
              </tr>
            </thead>
            <tbody>
              {analytics.experiments.map((experiment) => (
                <tr key={experiment.slug} className="border-t border-border">
                  <th scope="row" className="px-4 py-4 font-medium text-text-primary">
                    <Link
                      href={"/admin/labs/analytics/" + encodeURIComponent(experiment.slug)}
                      className="block transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {experiment.title}
                    </Link>
                    <span className="mt-1 block text-xs font-normal text-text-tertiary">
                      {experiment.slug}
                    </span>
                  </th>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.sourceOpens)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.uniqueVerifiedAccounts)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.codeCopies)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.activeAnonymousLikes)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.activeVerifiedLikes)}</td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums">{number(experiment.totalActiveLikes)}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveTarget(experiment);
                        setRemoveConfirmation("");
                        setAnalyticsMutationError("");
                      }}
                      disabled={Boolean(mutatingSlug)}
                      aria-label={"Remove " + experiment.title + " from analytics"}
                      title="Remove from analytics only"
                      onMouseEnter={() => removeRowIconRefs.current.get(experiment.slug)?.startAnimation?.()}
                      onMouseLeave={() => removeRowIconRefs.current.get(experiment.slug)?.stopAnimation?.()}
                      onFocus={() => removeRowIconRefs.current.get(experiment.slug)?.startAnimation?.()}
                      onBlur={() => removeRowIconRefs.current.get(experiment.slug)?.stopAnimation?.()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-error/30 bg-error/[0.035] text-error transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-error/60 hover:bg-error/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <AnimatedTrash ref={(node) => { if (node) removeRowIconRefs.current.set(experiment.slug, node); else removeRowIconRefs.current.delete(experiment.slug); }} size={14} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {!analytics.experiments.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-text-tertiary">
                    No experiments are currently published from Source Management with a matching ready build.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {analytics.hiddenExperiments?.length ? (
        <section aria-labelledby="hidden-analytics-experiments-title" className="rounded-[3px] mt-6 border border-border bg-surface-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="hidden-analytics-experiments-title" className="text-sm font-semibold">Hidden from analytics</h2>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                These experiments are hidden only from this dashboard. Source Management, published pages, source history, builds, likes and stored event records are unchanged.
              </p>
            </div>
            <span className="text-xs tabular-nums text-text-tertiary">{analytics.hiddenExperiments.length} hidden</span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {analytics.hiddenExperiments.map((experiment) => (
              <li key={experiment.slug} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-text-primary">{experiment.title}</p>
                  <p className="mt-1 font-mono text-[10px] text-text-tertiary">{experiment.slug}</p>
                  {experiment.hiddenAt ? (
                    <p className="mt-1 text-[10px] text-text-tertiary">Hidden {formatUpdatedAt(experiment.hiddenAt)}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => restoreExperimentAnalytics(experiment.slug)}
                  onMouseEnter={() => restoreIconRefs.current.get(experiment.slug)?.startAnimation?.()}
                  onMouseLeave={() => restoreIconRefs.current.get(experiment.slug)?.stopAnimation?.()}
                  onFocus={() => restoreIconRefs.current.get(experiment.slug)?.startAnimation?.()}
                  onBlur={() => restoreIconRefs.current.get(experiment.slug)?.stopAnimation?.()}
                  disabled={Boolean(mutatingSlug)}
                  className="inline-flex h-8 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-medium text-text-secondary transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:text-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <AnimatedRotateCcw ref={(node) => { if (node) restoreIconRefs.current.set(experiment.slug, node); else restoreIconRefs.current.delete(experiment.slug); }} size={13} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                  {mutatingSlug === "restore:" + experiment.slug ? "Restoring…" : "Restore"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {analyticsMutationError && !removeTarget ? (
        <p role="alert" className="rounded-[2px] mt-4 border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
          {analyticsMutationError}
        </p>
      ) : null}

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

      {removeTarget ? (
        <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.18 }} className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation">
          <motion.section role="dialog" aria-modal="true" aria-labelledby="remove-analytics-experiment-title" initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md rounded-[4px] border border-error/25 bg-surface-1 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.48)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">ANALYTICS ONLY</p>
                <div className="mt-2 flex items-center gap-2">
                  <AnimatedTrash ref={removeDialogIconRef} size={17} duration={0.68} isAnimated={!prefersReducedMotion} className="shrink-0 text-error" aria-hidden="true" />
                  <h2 id="remove-analytics-experiment-title" className="text-base font-semibold">
                    Remove from analytics?
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRemoveTarget(null);
                  setRemoveConfirmation("");
                  setAnalyticsMutationError("");
                }}
                aria-label="Close confirmation"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-border text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-text-secondary">
              <strong className="text-text-primary">{removeTarget.title}</strong> will disappear from this analytics dashboard and its aggregate metrics. The published experiment, Source Management record, source history, builds, likes and stored analytics events will not be deleted. You can restore it later.
            </p>
            <label htmlFor="confirm-remove-analytics-slug" className="mt-4 block text-xs font-medium text-text-secondary">
              Type <code className="font-mono text-text-primary">{removeTarget.slug}</code> to confirm.
            </label>
            <input
              id="confirm-remove-analytics-slug"
              value={removeConfirmation}
              onChange={(event) => setRemoveConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 h-10 w-full rounded-[2px] border border-border bg-background px-3 font-mono text-xs text-text-primary outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand focus:ring-2 focus:ring-brand/15 motion-reduce:transition-none"
              placeholder={removeTarget.slug}
            />
            {analyticsMutationError ? (
              <p role="alert" className="mt-3 text-xs text-warning">{analyticsMutationError}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRemoveTarget(null);
                  setRemoveConfirmation("");
                  setAnalyticsMutationError("");
                }}
                disabled={Boolean(mutatingSlug)}
                className="h-9 rounded-[2px] border border-border bg-surface-2/40 px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeExperimentFromAnalytics}
                onMouseEnter={() => removeConfirmIconRef.current?.startAnimation?.()}
                onMouseLeave={() => removeConfirmIconRef.current?.stopAnimation?.()}
                onFocus={() => removeConfirmIconRef.current?.startAnimation?.()}
                onBlur={() => removeConfirmIconRef.current?.stopAnimation?.()}
                disabled={mutatingSlug === removeTarget.slug || removeConfirmation.trim() !== removeTarget.slug}
                className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-error/55 bg-error/10 px-3 text-xs font-semibold text-error transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:bg-error/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <AnimatedTrash ref={removeConfirmIconRef} size={13} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                {mutatingSlug === removeTarget.slug ? "Removing…" : "Remove from analytics"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </>
  );
}
