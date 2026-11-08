import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPortfolioVisitDeletionFilter,
  DELETE_ALL_CONFIRMATION,
  getPortfolioDeleteConfirmation,
  MAX_PORTFOLIO_DELETE_RANGE_DAYS,
  MAX_PORTFOLIO_VISITS_PER_DELETE,
  parsePortfolioVisitDeletionPayload,
} from "../src/app/lib/portfolio-analytics/deletion-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const now = new Date("2026-11-07T12:00:00.000Z");
const ids = [
  "674c1a5e9f4d3b2a1c0e9876",
  "674c1a5e9f4d3b2a1c0e9877",
];

test("selected deletion accepts bounded unique ObjectIds and exact confirmation", () => {
  const confirmation = getPortfolioDeleteConfirmation({
    scope: "selected",
    visitIds: ids,
  });

  assert.equal(confirmation, "DELETE 2 SELECTED VISITS");
  assert.deepEqual(
    parsePortfolioVisitDeletionPayload({
      scope: "selected",
      visitIds: ids,
      confirmation,
    }, now),
    { scope: "selected", visitIds: ids },
  );
});

test("selected deletion rejects empty, oversized, duplicate and malformed identifiers", () => {
  assert.equal(MAX_PORTFOLIO_VISITS_PER_DELETE, 25);

  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: [],
    confirmation: "DELETE 0 SELECTED VISITS",
  }, now));

  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: Array.from({ length: 26 }, (_, index) =>
      (index + 1).toString(16).padStart(24, "0"),
    ),
    confirmation: "DELETE 26 SELECTED VISITS",
  }, now));

  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: [ids[0], ids[0]],
    confirmation: "DELETE 2 SELECTED VISITS",
  }, now));

  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: ["not-an-object-id"],
    confirmation: "DELETE 1 SELECTED VISIT",
  }, now));
});

test("selected and all deletion require exact scope-specific confirmation", () => {
  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: ids,
    confirmation: DELETE_ALL_CONFIRMATION,
  }, now));

  assert.equal(DELETE_ALL_CONFIRMATION, "DELETE ALL PORTFOLIO VISIT DATA");
  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "all",
    confirmation: "delete all portfolio visit data",
  }, now));

  assert.deepEqual(
    parsePortfolioVisitDeletionPayload({
      scope: "all",
      confirmation: DELETE_ALL_CONFIRMATION,
    }, now),
    { scope: "all" },
  );
});

test("date-range deletion is inclusive, UTC-normalized and capped at 65 days", () => {
  assert.equal(MAX_PORTFOLIO_DELETE_RANGE_DAYS, 65);

  const parsed = parsePortfolioVisitDeletionPayload({
    scope: "date_range",
    from: "2026-11-01",
    to: "2026-11-07",
    confirmation: "DELETE VISITS FROM 2026-11-01 TO 2026-11-07",
  }, now);

  assert.equal(parsed.from.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(parsed.toExclusive.toISOString(), "2026-11-08T00:00:00.000Z");
});

test("date-range deletion rejects reversed, future, invalid and overlong date windows", () => {
  const invalidRanges = [
    ["2026-11-06", "2026-11-05"],
    ["2026-11-01", "2026-11-08"],
    ["2026-02-30", "2026-03-01"],
    ["2026-09-01", "2026-11-07"],
  ];

  for (const [from, to] of invalidRanges) {
    assert.throws(() => parsePortfolioVisitDeletionPayload({
      scope: "date_range",
      from,
      to,
      confirmation: "DELETE VISITS FROM " + from + " TO " + to,
    }, now));
  }
});

test("deletion parser rejects unknown properties and unsupported scopes", () => {
  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "all",
    confirmation: DELETE_ALL_CONFIRMATION,
    collection: "portfolio_visits",
  }, now));

  assert.throws(() => parsePortfolioVisitDeletionPayload({
    scope: "custom",
    confirmation: "anything",
  }, now));
});

test("server filters are created from validated scopes only", () => {
  class FakeObjectId {
    constructor(value) {
      this.value = value;
    }
  }

  const selected = parsePortfolioVisitDeletionPayload({
    scope: "selected",
    visitIds: ids,
    confirmation: "DELETE 2 SELECTED VISITS",
  }, now);

  assert.deepEqual(
    buildPortfolioVisitDeletionFilter(selected, FakeObjectId),
    { _id: { $in: ids.map((value) => new FakeObjectId(value)) } },
  );

  const range = parsePortfolioVisitDeletionPayload({
    scope: "date_range",
    from: "2026-11-01",
    to: "2026-11-07",
    confirmation: "DELETE VISITS FROM 2026-11-01 TO 2026-11-07",
  }, now);

  assert.deepEqual(buildPortfolioVisitDeletionFilter(range), {
    startedAt: {
      $gte: new Date("2026-11-01T00:00:00.000Z"),
      $lt: new Date("2026-11-08T00:00:00.000Z"),
    },
  });

  assert.deepEqual(buildPortfolioVisitDeletionFilter({ scope: "all" }), {});
});

test("DELETE endpoint checks origin and owner before reading deletion body or connecting to MongoDB", async () => {
  const route = await read("../src/app/api/v1/admin/portfolio/analytics/visits/route.js");
  const origin = route.indexOf("isSameOriginPortfolioRequest(request)");
  const session = route.indexOf("getCurrentAuthSession()");
  const owner = route.indexOf("if (!isLabsOwner(session.user))");
  const body = route.indexOf("readPortfolioAnalyticsJson(request)");
  const deletion = route.indexOf("deletePortfolioVisitRecords(parsedScope)");

  assert.ok(origin >= 0);
  assert.ok(session > origin);
  assert.ok(owner > session);
  assert.ok(body > owner);
  assert.ok(deletion > body);
  assert.ok(route.includes("parsePortfolioVisitDeletionPayload"));
  assert.ok(route.includes('"Cache-Control": "private, no-store'));
  assert.ok(route.includes("}, 404"));
  assert.ok(route.includes("}, 403"));
});
