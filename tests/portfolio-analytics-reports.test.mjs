import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildCompletePortfolioDailySeries,
  buildPortfolioRecentCursorMatch,
  decodePortfolioRecentCursor,
  encodePortfolioRecentCursor,
  normalizePortfolioAnalyticsPeriod,
  normalizePortfolioRecentLimit,
} from "../src/app/lib/portfolio-analytics/report-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const objectId = "674c1a5e9f4d3b2a1c0e9876";

test("report periods accept only 7, 30 and 60 UTC calendar days", () => {
  const now = new Date("2026-11-07T12:34:56.000Z");
  const expectedFrom = new Map([
    [7, "2026-11-01"],
    [30, "2026-10-09"],
    [60, "2026-09-09"],
  ]);

  for (const days of [7, 30, 60]) {
    const period = normalizePortfolioAnalyticsPeriod(days, now);
    assert.equal(period.days, days);
    assert.equal(period.to.toISOString(), now.toISOString());
    assert.equal(period.from.toISOString().slice(0, 10), expectedFrom.get(days));
    assert.equal(period.timeZone, "UTC");
  }

  assert.equal(normalizePortfolioAnalyticsPeriod(90, now).days, 30);
  assert.equal(normalizePortfolioAnalyticsPeriod("7", now).days, 7);
});

test("daily report includes one bucket per selected UTC day and fills missing days", () => {
  const daily = buildCompletePortfolioDailySeries({
    from: new Date("2026-11-01T00:00:00.000Z"),
    to: new Date("2026-11-03T16:30:00.000Z"),
    groups: [
      { _id: "2026-11-01", visits: 4, activeSeconds: 35 },
      { _id: "2026-11-03", visits: 2, activeSeconds: 10 },
    ],
  });

  assert.deepEqual(daily, [
    { date: "2026-11-01", visits: 4, activeSeconds: 35 },
    { date: "2026-11-02", visits: 0, activeSeconds: 0 },
    { date: "2026-11-03", visits: 2, activeSeconds: 10 },
  ]);
});

test("daily builder rejects invalid and reversed date windows", () => {
  assert.throws(() => buildCompletePortfolioDailySeries({
    from: "invalid",
    to: new Date(),
  }));
  assert.throws(() => buildCompletePortfolioDailySeries({
    from: new Date("2026-11-04T00:00:00.000Z"),
    to: new Date("2026-11-03T00:00:00.000Z"),
  }), /not be later/);
});

test("recent visit cursor round-trips timestamp and MongoDB ObjectId", () => {
  const startedAt = new Date("2026-11-07T10:20:30.123Z");
  const cursor = encodePortfolioRecentCursor({ startedAt, id: objectId });
  assert.deepEqual(decodePortfolioRecentCursor(cursor), { startedAt, id: objectId });
});

test("recent cursor validation rejects malformed, tampered and extended payloads", () => {
  const valid = encodePortfolioRecentCursor({
    startedAt: new Date("2026-11-07T10:20:30.123Z"),
    id: objectId,
  });
  const bad = [
    "",
    "bad!",
    "x".repeat(300),
    Buffer.from(JSON.stringify({ startedAt: "not-a-date", id: objectId })).toString("base64url"),
    Buffer.from(JSON.stringify({ startedAt: "2026-11-07T10:20:30.123Z", id: "invalid" })).toString("base64url"),
    Buffer.from(JSON.stringify({ startedAt: "2026-11-07T10:20:30.123Z", id: objectId, extra: true })).toString("base64url"),
  ];

  assert.ok(valid);
  for (const cursor of bad) assert.throws(() => decodePortfolioRecentCursor(cursor));
  assert.throws(() => encodePortfolioRecentCursor({ startedAt: new Date(), id: "invalid" }));
});

test("recent cursor predicate provides deterministic startedAt and ObjectId tie-breaks", () => {
  class FakeObjectId {
    constructor(value) {
      this.value = value;
    }
  }
  const startedAt = new Date("2026-11-07T10:20:30.123Z");
  const cursor = encodePortfolioRecentCursor({ startedAt, id: objectId });

  assert.deepEqual(buildPortfolioRecentCursorMatch(cursor, FakeObjectId), {
    $or: [
      { startedAt: { $lt: startedAt } },
      { startedAt, _id: { $lt: new FakeObjectId(objectId) } },
    ],
  });
  assert.equal(buildPortfolioRecentCursorMatch(null, FakeObjectId), null);
});

test("recent page limit defaults to 25 and clamps to 1 through 50", () => {
  assert.equal(normalizePortfolioRecentLimit(), 25);
  assert.equal(normalizePortfolioRecentLimit(0), 1);
  assert.equal(normalizePortfolioRecentLimit(20), 20);
  assert.equal(normalizePortfolioRecentLimit(500), 50);
  assert.equal(normalizePortfolioRecentLimit("invalid"), 25);
});

test("report service is server-only, date-bounded, uses bounded facets and safe cursor projection", async () => {
  const [service, model, indexes] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/report-service.js"),
    read("../src/app/lib/portfolio-analytics/models/PortfolioVisit.js"),
    read("../scripts/ensure-portfolio-analytics-indexes.mjs"),
  ]);

  assert.ok(service.includes('import "server-only"'));
  assert.ok(service.includes("normalizePortfolioAnalyticsPeriod"));
  assert.ok(service.includes("REPORT_TOP_LIMIT = 12"));
  assert.ok(service.includes(".allowDiskUse(true)"));
  assert.ok(service.includes('timezone: "UTC"'));
  assert.ok(service.includes("uniqueTabSessions"));
  assert.ok(service.includes("buildPortfolioRecentCursorMatch"));
  assert.ok(service.includes(".sort({ startedAt: -1, _id: -1 })"));
  assert.ok(service.includes(".limit(safeLimit + 1)"));
  assert.ok(model.includes("portfolio_visits_recent_cursor"));
  assert.ok(model.includes("portfolio_visits_started_session_distinct"));
  assert.ok(indexes.includes("portfolio_visits_recent_cursor"));
  assert.ok(indexes.includes("portfolio_visits_started_session_distinct"));

  const mapperStart = service.indexOf("function mapRecentVisit");
  const mapperEnd = service.indexOf("export async function getPortfolioRecentVisits");
  const mapper = service.slice(mapperStart, mapperEnd);
  assert.ok(mapper.includes("accountId: document.verifiedUserAccountId || null"));
  assert.ok(service.includes("+verifiedUserAccountId +verifiedUserName +verifiedUserEmailMasked"));
  for (const field of ["sessionHash", "startKeyHash", "visitId", "userAgent", "ipAddress"]) {
    assert.equal(mapper.includes(field), false, field);
  }
});


test("all Portfolio Analytics reports exclude the exact owner account while retaining Labs experiment reporting", async () => {
  const [report, api, page, visitUtils, dashboard] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/report-service.js"),
    read("../src/app/api/v1/admin/portfolio/analytics/route.js"),
    read("../src/app/admin/portfolio/analytics/page.js"),
    read("../src/app/lib/portfolio-analytics/visit-utils.mjs"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
  ]);

  assert.ok(report.includes("getPortfolioAnalyticsExcludedOwnerAccountId"));
  assert.ok(report.includes("match.verifiedUserAccountId = { $ne: excludedOwnerAccountId }"));
  assert.ok(report.includes("function getExcludedOwnerAccountId(excludedOwnerUser)"));
  assert.equal(report.includes("PORTFOLIO_ANALYTICS_OWNER_EXCLUSION_NOT_CONFIGURED"), false);
  assert.equal(report.includes("getPortfolioAnalyticsConfig"), false);
  assert.ok(report.includes("excludedOwnerUser = null"));
  assert.ok(report.includes("dateRangeMatch(period, excludedOwnerAccountId)"));
  assert.ok(api.includes("excludedOwnerUser: session.user"));
  assert.ok(page.includes("excludedOwnerUser: session.user"));

  // Preserve experiment and Labs analytics: only the owner identity is excluded.
  assert.ok(visitUtils.includes('"labs_index"'));
  assert.ok(visitUtils.includes('"lab_detail"'));
  assert.ok(visitUtils.includes('pageType: "lab_detail"'));
  assert.ok(dashboard.includes('lab_detail: "Lab detail"'));
  assert.ok(dashboard.includes("Visitor activity"));
  assert.ok(dashboard.includes("Page types"));
  assert.ok(report.includes("pageTypes:"));
  assert.ok(report.includes("topPages:"));
});


test("the report exclusion matches only the owner account ID and keeps guests and other verified users", async () => {
  const [report, helper] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/report-service.js"),
    read("../src/app/lib/portfolio-analytics/verified-visitor.mjs"),
  ]);

  assert.ok(report.includes("getPortfolioAnalyticsExcludedOwnerAccountId"));
  assert.ok(report.includes("if (excludedOwnerAccountId)"));
  assert.ok(report.includes('match.verifiedUserAccountId = { $ne: excludedOwnerAccountId }'));
  assert.ok(helper.includes('user.email.trim().toLowerCase() === PORTFOLIO_ANALYTICS_EXCLUDED_OWNER_EMAIL'));
  assert.ok(helper.includes("export function getPortfolioAnalyticsExcludedOwnerAccountId"));
  assert.ok(helper.includes("export function isPortfolioAnalyticsExcludedOwner"));
  assert.ok(helper.includes("export function buildPortfolioVerifiedVisitor"));
  assert.ok(helper.includes("isPortfolioAnalyticsExcludedOwner(user) ||"));

  // MongoDB $ne matches documents where verifiedUserAccountId is missing,
  // so guest/unverified rows remain reportable. Other account IDs also match.
  assert.ok(report.includes("match.verifiedUserAccountId = { $ne: excludedOwnerAccountId }"));
  assert.equal(report.includes("verifiedUserHash: { $ne:"), false);
});
