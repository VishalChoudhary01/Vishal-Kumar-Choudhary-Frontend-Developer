import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parsePortfolioAnalyticsReadQuery } from "../src/app/lib/portfolio-analytics/read-query.mjs";
import {
  getPortfolioAnalyticsPollDelay,
  PORTFOLIO_ANALYTICS_MAX_POLL_BACKOFF_MS,
  PORTFOLIO_ANALYTICS_POLL_INTERVALS,
  shouldPollPortfolioAnalytics,
} from "../src/app/lib/portfolio-analytics/polling-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("read API query defaults to a 30-day summary", () => {
  assert.deepEqual(
    parsePortfolioAnalyticsReadQuery(new URLSearchParams()),
    { view: "summary", days: 30, cursor: null },
  );
});

test("read API accepts bounded summary periods and recent cursor pages", () => {
  assert.deepEqual(
    parsePortfolioAnalyticsReadQuery(new URLSearchParams("view=summary&days=7")),
    { view: "summary", days: 7, cursor: null },
  );
  assert.deepEqual(
    parsePortfolioAnalyticsReadQuery(new URLSearchParams("view=recent&days=60&cursor=YWJjZGVmZ2g")),
    { view: "recent", days: 60, cursor: "YWJjZGVmZ2g" },
  );
});

test("read API rejects unsupported, duplicated and extraneous parameters", () => {
  for (const query of [
    "view=private",
    "days=90",
    "view=summary&cursor=YWJjZGVmZ2g",
    "view=recent&cursor=bad%21",
    "view=recent&days=30&days=60",
    "view=summary&token=secret",
    "view=recent&cursor=" + "a".repeat(300),
  ]) {
    assert.throws(
      () => parsePortfolioAnalyticsReadQuery(new URLSearchParams(query)),
      { code: "INVALID_ANALYTICS_QUERY", status: 400 },
      query,
    );
  }
});

test("summary and recent polling intervals are independent", () => {
  assert.equal(PORTFOLIO_ANALYTICS_POLL_INTERVALS.summary, 10_000);
  assert.equal(PORTFOLIO_ANALYTICS_POLL_INTERVALS.recent, 30_000);
});

test("polling uses exponential backoff and caps at 60 seconds", () => {
  const interval = PORTFOLIO_ANALYTICS_POLL_INTERVALS.summary;
  assert.equal(getPortfolioAnalyticsPollDelay({ interval, failures: 0 }), 10_000);
  assert.equal(getPortfolioAnalyticsPollDelay({ interval, failures: 1 }), 20_000);
  assert.equal(getPortfolioAnalyticsPollDelay({ interval, failures: 2 }), 40_000);
  assert.equal(getPortfolioAnalyticsPollDelay({ interval, failures: 3 }), 60_000);
  assert.equal(getPortfolioAnalyticsPollDelay({ interval, failures: 8 }), PORTFOLIO_ANALYTICS_MAX_POLL_BACKOFF_MS);
  assert.equal(getPortfolioAnalyticsPollDelay({ interval: 30_000, failures: 1 }), 60_000);
});

test("polling is permitted only when the document is visible", () => {
  assert.equal(shouldPollPortfolioAnalytics("visible"), true);
  assert.equal(shouldPollPortfolioAnalytics("hidden"), false);
  assert.equal(shouldPollPortfolioAnalytics("prerender"), false);
  assert.equal(shouldPollPortfolioAnalytics(undefined), false);
});

test("read endpoint checks the owner before querying reporting services and uses no-store responses", async () => {
  const route = await read("../src/app/api/v1/admin/portfolio/analytics/route.js");
  const sessionLookup = route.indexOf("getCurrentAuthSession()");
  const ownerCheck = route.indexOf("if (!isLabsOwner(session.user))");
  const summaryQuery = route.indexOf("getPortfolioAnalyticsReport({ days: query.days })");
  const recentQuery = route.indexOf("getPortfolioRecentVisits({");
  assert.ok(sessionLookup >= 0);
  assert.ok(ownerCheck > sessionLookup);
  assert.ok(summaryQuery > ownerCheck);
  assert.ok(recentQuery > ownerCheck);
  assert.ok(route.includes('"Cache-Control": "private, no-store'));
  assert.ok(route.includes('status: 404'));
  assert.ok(route.includes("parsePortfolioAnalyticsReadQuery"));
});

test("polling hook separates requests, aborts hidden-tab work and preserves stale data on failure", async () => {
  const hook = await read("../src/app/hooks/portfolio-analytics/usePortfolioAnalyticsPolling.js");

  assert.ok(hook.includes('createRequestUrl("summary", days, null)'));
  assert.ok(hook.includes('createRequestUrl("recent", days, cursor)'));
  assert.ok(hook.includes("summaryController?.abort()"));
  assert.ok(hook.includes("recentController?.abort()"));
  assert.ok(hook.includes("document.visibilityState"));
  assert.ok(hook.includes("getPortfolioAnalyticsPollDelay"));
  assert.ok(hook.includes("if (active) setSummaryRefreshing(false)"));
  assert.ok(hook.includes("if (active) setRecentRefreshing(false)"));
  assert.ok(hook.includes("setReportError("));
  assert.ok(hook.includes("setRecentError("));
  assert.ok(hook.includes("setNewVisitIds(insertedIds)"));
  assert.ok(hook.includes("manualRefreshRef.current = refreshBoth"));
});

test("dashboard exposes polling state, manual refresh and entrances only for newly inserted rows", async () => {
  const dashboard = await read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js");
  assert.ok(dashboard.includes("usePortfolioAnalyticsPolling"));
  assert.ok(dashboard.includes("Summary 10s · Recent visits 30s"));
  assert.ok(dashboard.includes("Refresh now"));
  assert.ok(dashboard.includes("newVisitIds"));
  assert.ok(dashboard.includes("initial={isNew ? { opacity: 0, y: 10 } : false}"));
  assert.ok(dashboard.includes("Showing the last successful data"));
});

test("page key resets the live view when date range or recent cursor changes", async () => {
  const page = await read("../src/app/admin/portfolio/analytics/page.js");
  assert.ok(page.includes('key={days + ":" + (cursor || "first")}'));
  assert.ok(page.includes("cursor={cursor}"));
});
