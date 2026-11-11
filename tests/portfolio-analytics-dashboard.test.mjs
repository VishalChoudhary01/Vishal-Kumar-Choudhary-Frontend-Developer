import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("dashboard route verifies the owner before private report queries", async () => {
  const page = await read("../src/app/admin/portfolio/analytics/page.js");
  const ownerCheck = page.indexOf("if (!isLabsOwner(session?.user))");
  const reportQuery = page.indexOf("getPortfolioAnalyticsReport({ days })");
  const recentQuery = page.indexOf("getPortfolioRecentVisits({ days, cursor, limit: 25 })");

  assert.ok(ownerCheck > -1);
  assert.ok(reportQuery > ownerCheck);
  assert.ok(recentQuery > ownerCheck);
  assert.ok(page.includes("force-no-store"));
  assert.ok(page.includes("notFound()"));
  assert.ok(page.includes("ALLOWED_PERIODS = [7, 30, 60]"));
});

test("dashboard maps real report fields and shows a real empty state", async () => {
  const dashboard = await read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js");

  for (const field of [
    "overview.totalVisits",
    "overview.uniqueTabSessions",
    "overview.averageActiveSeconds",
    "overview.totalActiveSeconds",
    "report?.daily",
    "report?.topPages",
    "report?.sources",
    "report?.cities",
    "report?.devices",
    "report?.pageTypes",
  ]) {
    assert.ok(dashboard.includes(field), field);
  }

  assert.ok(dashboard.includes("No visits have been recorded"));
  assert.ok(dashboard.includes("MotionNumber"));
  assert.ok(dashboard.includes("useReducedMotion"));
  assert.ok(dashboard.includes("RecentVisitsTable"));
  assert.ok(dashboard.includes("Visitor activity"));
  assert.ok(dashboard.includes("Visitor name"));
  assert.ok(dashboard.includes("Raw account ID"));
  assert.ok(dashboard.includes("visit.visitor.accountId"));
  assert.ok(dashboard.includes("Email (masked)"));
  assert.ok(dashboard.includes("Page visited"));
  assert.ok(dashboard.includes("getLocationLabel(visit)"));
  assert.ok(dashboard.includes("getDeviceLabel(visit.deviceType)"));
  assert.ok(dashboard.includes("One row per page visit"));
  assert.ok(dashboard.includes("nextCursor"));
  assert.ok(dashboard.includes("Load older visits"));
  assert.ok(!/mockVisits|sampleData|fakeAnalytics|DEMO_VISITS/.test(dashboard));
});

test("dashboard filters and pagination stay on the private owner route", async () => {
  const dashboard = await read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js");
  assert.ok(dashboard.includes('"/admin/portfolio/analytics?days=" + period'));
  assert.ok(dashboard.includes('"/admin/portfolio/analytics?days=" + days + "&cursor="'));
  assert.ok(dashboard.includes('aria-current={days === period ? "page" : undefined}'));
});

test("dashboard uses theme tokens and remains isolated from public page shells", async () => {
  const [dashboard, page, home, project, labs] = await Promise.all([
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/admin/portfolio/analytics/page.js"),
    read("../src/app/components/HomePage.js"),
    read("../src/app/projects/[slug]/ProjectPageView.js"),
    read("../src/app/components/labs/LabsPageShell.js"),
  ]);

  assert.ok(dashboard.includes("var(--brand)"));
  assert.ok(dashboard.includes("bg-surface-1"));
  assert.ok(dashboard.includes("border-border"));
  assert.ok(page.includes("PortfolioAnalyticsDashboard"));
  assert.ok(!home.includes("PortfolioAnalyticsDashboard"));
  assert.ok(!project.includes("PortfolioAnalyticsDashboard"));
  assert.ok(!labs.includes("PortfolioAnalyticsDashboard"));
});
