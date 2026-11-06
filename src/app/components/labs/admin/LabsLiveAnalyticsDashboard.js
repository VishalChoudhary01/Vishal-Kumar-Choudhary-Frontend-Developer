"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Copy,
  Eye,
  Heart,
  RefreshCw,
  Users,
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
  return (
    <article className="border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
          {label}
        </p>
        <Icon size={17} className="text-text-tertiary" aria-hidden="true" />
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

function LoadingMetrics() {
  return (
    <section aria-label="Loading engagement overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="min-h-32 border border-border bg-surface-1 p-5" aria-hidden="true">
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
  const [analytics, setAnalytics] = useState(initialAnalytics || null);
  const [lastUpdated, setLastUpdated] = useState(initialAnalytics?.generatedAt || null);
  const [refreshError, setRefreshError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const inFlightRef = useRef(false);
  const failureCountRef = useRef(0);
  const refreshRef = useRef(null);
  const scheduleRef = useRef(null);

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

  if (!analytics) {
    return (
      <section className="mt-7 border border-border bg-surface-1 p-6">
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
              className="mt-4 inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
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
          className="inline-flex h-8 items-center gap-2 border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          Refresh now
        </button>
      </div>

      {refreshError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning" role="status">
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
          icon={Eye}
          label="Source opens"
          value={totals.sourceOpens}
          detail="Successful verified source loads"
        />
        <MetricCard
          icon={Users}
          label="Verified accounts"
          value={totals.uniqueVerifiedAccounts}
          detail="Per-experiment unique accounts, summed"
        />
        <MetricCard
          icon={Copy}
          label="Code copies"
          value={totals.codeCopies}
          detail="Reported after clipboard success"
        />
        <MetricCard
          icon={Heart}
          label="Active likes"
          value={totals.totalActiveLikes}
          detail={number(totals.activeAnonymousLikes) + " anonymous · " + number(totals.activeVerifiedLikes) + " verified"}
        />
      </section>

      <LabsEngagementTrendChart daily={analytics.daily} />

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
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.sourceOpens)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.uniqueVerifiedAccounts)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.codeCopies)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.activeAnonymousLikes)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{number(experiment.activeVerifiedLikes)}</td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums">{number(experiment.totalActiveLikes)}</td>
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
  );
}
