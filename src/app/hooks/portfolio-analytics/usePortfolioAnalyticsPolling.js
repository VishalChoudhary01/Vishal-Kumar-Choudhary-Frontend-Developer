"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getPortfolioAnalyticsPollDelay,
  PORTFOLIO_ANALYTICS_POLL_INTERVALS,
  shouldPollPortfolioAnalytics,
} from "@/app/lib/portfolio-analytics/polling-utils.mjs";

const API_PATH = "/api/v1/admin/portfolio/analytics";

async function readAnalyticsResponse(response, expectedView) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.data) {
    const error = new Error(
      payload?.error?.message || "Portfolio analytics could not be refreshed.",
    );
    error.status = response.status;
    throw error;
  }

  if (expectedView === "summary" && !payload.data.generatedAt) {
    throw new Error("The analytics summary response is incomplete.");
  }
  if (
    expectedView === "recent" &&
    (!Array.isArray(payload.data.visits) || typeof payload.data.hasMore !== "boolean")
  ) {
    throw new Error("The recent-visits response is incomplete.");
  }

  return payload.data;
}

function createRequestUrl(view, days, cursor) {
  const params = new URLSearchParams({
    view,
    days: String(days),
  });

  if (view === "recent" && cursor) params.set("cursor", cursor);
  return API_PATH + "?" + params.toString();
}

export default function usePortfolioAnalyticsPolling({
  days,
  cursor = null,
  initialReport = null,
  initialRecentVisits = [],
  initialNextCursor = null,
  initialReportError = "",
  initialRecentError = "",
}) {
  const [report, setReport] = useState(initialReport);
  const [recentVisits, setRecentVisits] = useState(initialRecentVisits);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [reportError, setReportError] = useState(initialReportError);
  const [recentError, setRecentError] = useState(initialRecentError);
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);
  const [recentRefreshing, setRecentRefreshing] = useState(false);
  const [lastSummaryUpdatedAt, setLastSummaryUpdatedAt] = useState(
    initialReport?.generatedAt || null,
  );
  const [lastRecentUpdatedAt, setLastRecentUpdatedAt] = useState(
    initialReport?.generatedAt || null,
  );

  const manualRefreshRef = useRef(null);
  const recentVisitIdsRef = useRef(new Set(initialRecentVisits.map((visit) => visit.id)));
  const [newVisitIds, setNewVisitIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    let summaryTimer = null;
    let recentTimer = null;
    let summaryController = null;
    let recentController = null;
    let summaryInFlight = false;
    let recentInFlight = false;
    let summaryFailures = 0;
    let recentFailures = 0;

    const visible = () =>
      typeof document !== "undefined" &&
      shouldPollPortfolioAnalytics(document.visibilityState);

    const scheduleSummary = (delay) => {
      window.clearTimeout(summaryTimer);
      summaryTimer = window.setTimeout(() => {
        summaryTimer = null;
        void refreshSummary();
      }, delay);
    };

    const scheduleRecent = (delay) => {
      window.clearTimeout(recentTimer);
      recentTimer = window.setTimeout(() => {
        recentTimer = null;
        void refreshRecent();
      }, delay);
    };

    const refreshSummary = async () => {
      if (!active || !visible() || summaryInFlight) return;

      summaryInFlight = true;
      const controller = new AbortController();
      summaryController = controller;
      setSummaryRefreshing(true);

      try {
        const response = await fetch(
          createRequestUrl("summary", days, null),
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const data = await readAnalyticsResponse(response, "summary");

        if (!active || controller.signal.aborted) return;

        setReport(data);
        setLastSummaryUpdatedAt(data.generatedAt || new Date().toISOString());
        setReportError("");
        summaryFailures = 0;
      } catch (error) {
        if (error?.name !== "AbortError" && active && !controller.signal.aborted) {
          summaryFailures += 1;
          setReportError(
            error?.status === 401 || error?.status === 404
              ? "Owner access could not be verified. Sign in again."
              : "The summary refresh failed. Showing the last successful data.",
          );
        }
      } finally {
        summaryInFlight = false;
        if (summaryController === controller) summaryController = null;
        if (active) setSummaryRefreshing(false);

        if (active && visible()) {
          scheduleSummary(getPortfolioAnalyticsPollDelay({
            interval: PORTFOLIO_ANALYTICS_POLL_INTERVALS.summary,
            failures: summaryFailures,
          }));
        }
      }
    };

    const refreshRecent = async () => {
      if (!active || !visible() || recentInFlight) return;

      recentInFlight = true;
      const controller = new AbortController();
      recentController = controller;
      setRecentRefreshing(true);

      try {
        const response = await fetch(
          createRequestUrl("recent", days, cursor),
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const data = await readAnalyticsResponse(response, "recent");

        if (!active || controller.signal.aborted) return;

        const previousIds = recentVisitIdsRef.current;
        const incomingIds = new Set(data.visits.map((visit) => visit.id));
        const insertedIds = new Set(
          data.visits
            .filter((visit) => !previousIds.has(visit.id))
            .map((visit) => visit.id),
        );

        recentVisitIdsRef.current = incomingIds;
        setNewVisitIds(insertedIds);
        setRecentVisits(data.visits);
        setNextCursor(data.nextCursor || null);
        setLastRecentUpdatedAt(new Date().toISOString());
        setRecentError("");
        recentFailures = 0;
      } catch (error) {
        if (error?.name !== "AbortError" && active && !controller.signal.aborted) {
          recentFailures += 1;
          setRecentError(
            error?.status === 401 || error?.status === 404
              ? "Owner access could not be verified. Sign in again."
              : "Recent visits could not be refreshed. Showing the last successful rows.",
          );
        }
      } finally {
        recentInFlight = false;
        if (recentController === controller) recentController = null;
        if (active) setRecentRefreshing(false);

        if (active && visible()) {
          scheduleRecent(getPortfolioAnalyticsPollDelay({
            interval: PORTFOLIO_ANALYTICS_POLL_INTERVALS.recent,
            failures: recentFailures,
          }));
        }
      }
    };

    const refreshBoth = () => {
      if (!active || !visible()) return;
      window.clearTimeout(summaryTimer);
      window.clearTimeout(recentTimer);
      summaryTimer = null;
      recentTimer = null;
      void refreshSummary();
      void refreshRecent();
    };

    manualRefreshRef.current = refreshBoth;

    const handleVisibilityChange = () => {
      if (!visible()) {
        window.clearTimeout(summaryTimer);
        window.clearTimeout(recentTimer);
        summaryTimer = null;
        recentTimer = null;
        summaryController?.abort();
        recentController?.abort();
        return;
      }

      refreshBoth();
    };

    const handleFocus = () => {
      if (visible()) refreshBoth();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    if (visible()) {
      scheduleSummary(
        initialReport
          ? PORTFOLIO_ANALYTICS_POLL_INTERVALS.summary
          : 0,
      );
      scheduleRecent(
        initialRecentError
          ? 0
          : PORTFOLIO_ANALYTICS_POLL_INTERVALS.recent,
      );
    }

    return () => {
      active = false;
      window.clearTimeout(summaryTimer);
      window.clearTimeout(recentTimer);
      summaryController?.abort();
      recentController?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      manualRefreshRef.current = null;
    };
  }, [
    days,
    cursor,
    initialReport,
    initialRecentVisits,
    initialNextCursor,
    initialReportError,
    initialRecentError,
  ]);

  const refreshNow = useCallback(() => {
    manualRefreshRef.current?.();
  }, []);

  return {
    report,
    recentVisits,
    nextCursor,
    reportError,
    recentError,
    refreshing: summaryRefreshing || recentRefreshing,
    summaryRefreshing,
    recentRefreshing,
    lastSummaryUpdatedAt,
    lastRecentUpdatedAt,
    newVisitIds,
    refreshNow,
  };
}
