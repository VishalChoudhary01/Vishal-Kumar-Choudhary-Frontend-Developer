import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildActivityBuckets,
  buildCompleteDailySeries,
  createRankings,
  normalizePeriod,
  selectEligiblePublishedCustomExperiments,
  filterVisibleAnalyticsExperiments,
  applyActiveLikeGroups,
  applyAnalyticsEventGroups,
  summarizeAnalyticsRows,
  evaluateFixedWindowRateLimit,
  getSourceEventRateLimit,
} from "../src/app/lib/labs/owner-analytics-utils.mjs";

test("rankings omit zero-value rows, use stable tie-breaks and cap each list", () => {
  const rows = [
    { slug: "zeta", title: "Zeta", sourceOpens: 8, codeCopies: 1, totalActiveLikes: 0 },
    { slug: "alpha-two", title: "Alpha", sourceOpens: 8, codeCopies: 4, totalActiveLikes: 2, activeVerifiedLikes: 1, activeAnonymousLikes: 1 },
    { slug: "alpha-one", title: "Alpha", sourceOpens: 8, codeCopies: 4, totalActiveLikes: 2, activeVerifiedLikes: 2, activeAnonymousLikes: 0 },
    { slug: "beta", title: "Beta", sourceOpens: 2, codeCopies: 9, totalActiveLikes: 5, activeVerifiedLikes: 4, activeAnonymousLikes: 1 },
    { slug: "gamma", title: "Gamma", sourceOpens: 1, codeCopies: 2, totalActiveLikes: 1, activeVerifiedLikes: 1, activeAnonymousLikes: 0 },
    { slug: "zero", title: "Zero", sourceOpens: 0, codeCopies: 0, totalActiveLikes: 0 },
  ];

  const rankings = createRankings(rows);

  assert.deepEqual(
    rankings.mostSourceOpens.map((item) => [item.rank, item.slug, item.value]),
    [
      [1, "alpha-one", 8],
      [2, "alpha-two", 8],
      [3, "zeta", 8],
      [4, "beta", 2],
      [5, "gamma", 1],
    ],
  );
  assert.deepEqual(
    rankings.mostCodeCopies.map((item) => item.slug),
    ["beta", "alpha-one", "alpha-two", "gamma", "zeta"],
  );
  assert.deepEqual(
    rankings.mostActiveLikes.map((item) => item.slug),
    ["beta", "alpha-one", "alpha-two", "gamma"],
  );
  assert.deepEqual(rankings.mostActiveLikes[1], {
    rank: 2,
    slug: "alpha-one",
    title: "Alpha",
    value: 2,
    activeVerifiedLikes: 2,
    activeAnonymousLikes: 0,
  });
});

test("rankings support a bounded caller-provided limit", () => {
  const rows = [
    { slug: "one", title: "One", sourceOpens: 5, codeCopies: 0, totalActiveLikes: 0 },
    { slug: "two", title: "Two", sourceOpens: 4, codeCopies: 0, totalActiveLikes: 0 },
  ];

  assert.equal(createRankings(rows, 1).mostSourceOpens.length, 1);
  assert.equal(createRankings(rows, 0).mostSourceOpens.length, 0);
  assert.equal(createRankings(rows, -1).mostSourceOpens.length, 0);
});

test("reporting periods accept only supported day values and use the supplied clock", () => {
  const now = new Date("2026-11-06T08:30:00.000Z");

  for (const days of [7, 30, 90, 365]) {
    const result = normalizePeriod(days, now);
    assert.equal(result.periodDays, days);
    assert.equal(result.generatedAt.toISOString(), now.toISOString());
    assert.equal(result.since.toISOString(), new Date(now.getTime() - days * 86_400_000).toISOString());
  }

  for (const invalid of [0, 1, 14, 366, "invalid", null, undefined]) {
    assert.equal(normalizePeriod(invalid, now).periodDays, 30);
  }
});

test("daily series includes each UTC calendar day and fills missing dates with zeros", () => {
  const result = buildCompleteDailySeries({
    since: new Date("2026-11-04T23:45:00.000Z"),
    generatedAt: new Date("2026-11-06T01:15:00.000Z"),
    dailyGroups: [
      {
        _id: "2026-11-04",
        sourceOpens: 3,
        codeCopies: 1,
        verifiedLikeActions: 2,
        anonymousLikeActions: 4,
      },
      {
        _id: "2026-11-06",
        sourceOpens: 5,
        codeCopies: 2,
        verifiedLikeActions: 0,
        anonymousLikeActions: 1,
      },
    ],
  });

  assert.deepEqual(result, [
    {
      date: "2026-11-04",
      sourceOpens: 3,
      codeCopies: 1,
      componentCopies: 0,
      verifiedLikes: 0,
      verifiedUnlikes: 0,
      anonymousLikes: 0,
      anonymousUnlikes: 0,
      verifiedLikeActions: 2,
      anonymousLikeActions: 4,
      totalActions: 10,
    },
    {
      date: "2026-11-05",
      sourceOpens: 0,
      codeCopies: 0,
      componentCopies: 0,
      verifiedLikes: 0,
      verifiedUnlikes: 0,
      anonymousLikes: 0,
      anonymousUnlikes: 0,
      verifiedLikeActions: 0,
      anonymousLikeActions: 0,
      totalActions: 0,
    },
    {
      date: "2026-11-06",
      sourceOpens: 5,
      codeCopies: 2,
      componentCopies: 0,
      verifiedLikes: 0,
      verifiedUnlikes: 0,
      anonymousLikes: 0,
      anonymousUnlikes: 0,
      verifiedLikeActions: 0,
      anonymousLikeActions: 1,
      totalActions: 8,
    },
  ]);
});

test("daily series rejects invalid or reversed date bounds", () => {
  assert.throws(
    () => buildCompleteDailySeries({
      since: "not-a-date",
      generatedAt: new Date("2026-11-06T00:00:00.000Z"),
    }),
    { name: "TypeError" },
  );
  assert.throws(
    () => buildCompleteDailySeries({
      since: new Date("2026-11-07T00:00:00.000Z"),
      generatedAt: new Date("2026-11-06T00:00:00.000Z"),
    }),
    { name: "RangeError" },
  );
});


test("custom published experiments require a published source and an exact ready artifact match", () => {
  const experiments = [
    { slug: "valid", title: "Valid" },
    { slug: "stale-version", title: "Stale Version" },
    { slug: "wrong-experiment", title: "Wrong Experiment" },
    { slug: "unpublished-source", title: "Unpublished Source" },
    { slug: "missing-artifact", title: "Missing Artifact" },
    { slug: "duplicate", title: "Duplicate First" },
    { slug: "duplicate", title: "Duplicate Second" },
    { slug: "../invalid", title: "Invalid Slug" },
  ];
  const sources = [
    { slug: "valid", published: true, publishedVersionId: "v1", publishedArtifactId: "a1" },
    { slug: "stale-version", published: true, publishedVersionId: "v2", publishedArtifactId: "a2" },
    { slug: "wrong-experiment", published: true, publishedVersionId: "v1", publishedArtifactId: "a3" },
    { slug: "unpublished-source", published: false, publishedVersionId: "v1", publishedArtifactId: "a4" },
    { slug: "missing-artifact", published: true, publishedVersionId: "v1", publishedArtifactId: "missing" },
    { slug: "duplicate", published: true, publishedVersionId: "v1", publishedArtifactId: "a5" },
  ];
  const artifacts = [
    { artifactId: "a1", experimentSlug: "valid", sourceVersionId: "v1", status: "ready" },
    { artifactId: "a2", experimentSlug: "stale-version", sourceVersionId: "v1", status: "ready" },
    { artifactId: "a3", experimentSlug: "someone-else", sourceVersionId: "v1", status: "ready" },
    { artifactId: "a4", experimentSlug: "unpublished-source", sourceVersionId: "v1", status: "ready" },
    { artifactId: "a5", experimentSlug: "duplicate", sourceVersionId: "v1", status: "failed" },
    { artifactId: "a5", experimentSlug: "duplicate", sourceVersionId: "v1", status: "ready" },
  ];

  const result = selectEligiblePublishedCustomExperiments({ experiments, sources, artifacts });

  assert.deepEqual(result.map(({ experiment, artifact }) => [experiment.slug, artifact.artifactId]), [
    ["valid", "a1"],
    ["duplicate", "a5"],
  ]);
  assert.equal(result[0].experiment.title, "Valid");
  assert.equal(result[1].experiment.title, "Duplicate First");
});


test("event attribution counts only supported actor/event combinations", () => {
  const baseRows = [
    {
      slug: "alpha",
      title: "Alpha",
      sourceOpens: 0,
      uniqueVerifiedAccounts: 0,
      codeCopies: 0,
      componentCopies: 0,
      verifiedLikeActions: 0,
      verifiedUnlikeActions: 0,
      anonymousLikeActions: 0,
      anonymousUnlikeActions: 0,
      activeVerifiedLikes: 0,
      activeAnonymousLikes: 0,
      totalActiveLikes: 0,
    },
    {
      slug: "beta",
      title: "Beta",
      sourceOpens: 0,
      uniqueVerifiedAccounts: 0,
      codeCopies: 0,
      componentCopies: 0,
      verifiedLikeActions: 0,
      verifiedUnlikeActions: 0,
      anonymousLikeActions: 0,
      anonymousUnlikeActions: 0,
      activeVerifiedLikes: 0,
      activeAnonymousLikes: 0,
      totalActiveLikes: 0,
    },
  ];

  const eventGroups = [
    {
      _id: { slug: "alpha", eventType: "source_open", actorCategory: "verified_user" },
      count: 5,
      actorIds: ["user-1", "user-2", "user-1", null, ""],
    },
    {
      _id: { slug: "alpha", eventType: "code_copy", actorCategory: "verified_user" },
      count: 3,
      actorIds: ["user-1", "user-2"],
    },
    {
      _id: { slug: "alpha", eventType: "like", actorCategory: "verified_user" },
      count: 4,
      actorIds: ["user-1"],
    },
    {
      _id: { slug: "alpha", eventType: "unlike", actorCategory: "verified_user" },
      count: 2,
      actorIds: ["user-2"],
    },
    {
      _id: { slug: "alpha", eventType: "guest_like", actorCategory: "guest" },
      count: 7,
    },
    {
      _id: { slug: "alpha", eventType: "guest_unlike", actorCategory: "guest" },
      count: 1,
    },
    // Guest source opens/copies are intentionally ignored by the current
    // protected-source metric contract.
    {
      _id: { slug: "alpha", eventType: "source_open", actorCategory: "guest" },
      count: 50,
      actorIds: ["guest-1"],
    },
    {
      _id: { slug: "alpha", eventType: "code_copy", actorCategory: "guest" },
      count: 50,
    },
    // A group with an invalid actor category must not be attributed.
    {
      _id: { slug: "alpha", eventType: "like", actorCategory: "unknown" },
      count: 50,
    },
    // Events for slugs outside the published catalogue are ignored.
    {
      _id: { slug: "not-published", eventType: "source_open", actorCategory: "verified_user" },
      count: 99,
      actorIds: ["user-3"],
    },
    {
      _id: { slug: "beta", eventType: "source_open", actorCategory: "verified_user" },
      count: 1,
      actorIds: ["user-1"],
    },
  ];

  eventGroups.push({
    _id: { slug: "alpha", eventType: "component_copy", actorCategory: "verified_user" },
    count: 2,
  });

  const result = applyAnalyticsEventGroups(baseRows, eventGroups);
  const alpha = result.find((row) => row.slug === "alpha");
  const beta = result.find((row) => row.slug === "beta");

  assert.deepEqual(
    {
      sourceOpens: alpha.sourceOpens,
      uniqueVerifiedAccounts: alpha.uniqueVerifiedAccounts,
      codeCopies: alpha.codeCopies,
      componentCopies: alpha.componentCopies,
      verifiedLikeActions: alpha.verifiedLikeActions,
      verifiedUnlikeActions: alpha.verifiedUnlikeActions,
      anonymousLikeActions: alpha.anonymousLikeActions,
      anonymousUnlikeActions: alpha.anonymousUnlikeActions,
    },
    {
      sourceOpens: 5,
      uniqueVerifiedAccounts: 2,
      codeCopies: 3,
      componentCopies: 2,
      verifiedLikeActions: 4,
      verifiedUnlikeActions: 2,
      anonymousLikeActions: 7,
      anonymousUnlikeActions: 1,
    },
  );
  assert.equal(beta.sourceOpens, 1);
  assert.equal(beta.uniqueVerifiedAccounts, 1);
  assert.equal(baseRows[0].sourceOpens, 0, "helper must not mutate the input rows");
});

test("active-like attribution keeps verified and anonymous states separate", () => {
  const rows = [
    { slug: "alpha", activeVerifiedLikes: 0, activeAnonymousLikes: 0, totalActiveLikes: 0 },
    { slug: "beta", activeVerifiedLikes: 0, activeAnonymousLikes: 0, totalActiveLikes: 0 },
  ];

  const result = applyActiveLikeGroups(
    rows,
    [
      { _id: "alpha", count: 4 },
      { _id: "not-published", count: 100 },
      { _id: "beta", count: 0 },
    ],
    [
      { _id: "alpha", count: 3 },
      { _id: "beta", count: 2 },
    ],
  );

  assert.deepEqual(result, [
    { slug: "alpha", activeVerifiedLikes: 4, activeAnonymousLikes: 3, totalActiveLikes: 7 },
    { slug: "beta", activeVerifiedLikes: 0, activeAnonymousLikes: 2, totalActiveLikes: 2 },
  ]);
  assert.deepEqual(rows, [
    { slug: "alpha", activeVerifiedLikes: 0, activeAnonymousLikes: 0, totalActiveLikes: 0 },
    { slug: "beta", activeVerifiedLikes: 0, activeAnonymousLikes: 0, totalActiveLikes: 0 },
  ]);
});

test("collection totals equal the sum of per-experiment aggregate values", () => {
  const rows = [
    {
      sourceOpens: 5,
      uniqueVerifiedAccounts: 2,
      codeCopies: 3,
      componentCopies: 2,
      verifiedLikeActions: 4,
      verifiedUnlikeActions: 2,
      anonymousLikeActions: 7,
      anonymousUnlikeActions: 1,
      activeVerifiedLikes: 4,
      activeAnonymousLikes: 3,
      totalActiveLikes: 7,
    },
    {
      sourceOpens: 1,
      uniqueVerifiedAccounts: 1,
      codeCopies: 2,
      componentCopies: 1,
      verifiedLikeActions: 1,
      verifiedUnlikeActions: 0,
      anonymousLikeActions: 0,
      anonymousUnlikeActions: 1,
      activeVerifiedLikes: 0,
      activeAnonymousLikes: 2,
      totalActiveLikes: 2,
    },
  ];

  assert.deepEqual(summarizeAnalyticsRows(rows), {
    sourceOpens: 6,
    uniqueVerifiedAccounts: 3,
    codeCopies: 5,
    componentCopies: 3,
    verifiedLikeActions: 5,
    verifiedUnlikeActions: 2,
    anonymousLikeActions: 7,
    anonymousUnlikeActions: 2,
    activeVerifiedLikes: 4,
    activeAnonymousLikes: 5,
    totalActiveLikes: 9,
  });
});


test("source event quotas are scoped by event type", () => {
  assert.equal(getSourceEventRateLimit("source_open"), 30);
  // Allow normal repeated copy interactions without removing the per-minute ceiling.
  assert.equal(getSourceEventRateLimit("code_copy"), 60);
  assert.equal(getSourceEventRateLimit("like"), null);
  assert.equal(getSourceEventRateLimit("unknown"), null);
  assert.equal(getSourceEventRateLimit("toString"), null);
  assert.equal(getSourceEventRateLimit("__proto__"), null);
});

test("fixed-window rate limit reports remaining capacity and retry time", () => {
  const now = new Date("2026-11-06T10:00:30.000Z");
  const start = new Date("2026-11-06T10:00:00.000Z");

  assert.deepEqual(
    evaluateFixedWindowRateLimit({
      count: 20,
      windowStartedAt: start,
      now,
      windowMs: 60_000,
      maxEvents: 20,
    }),
    {
      allowed: true,
      retryAfterSeconds: 30,
      remaining: 0,
    },
  );

  assert.deepEqual(
    evaluateFixedWindowRateLimit({
      count: 21,
      windowStartedAt: start,
      now,
      windowMs: 60_000,
      maxEvents: 20,
    }),
    {
      allowed: false,
      retryAfterSeconds: 30,
      remaining: 0,
    },
  );
});

test("fixed-window rate limit rejects invalid policy input", () => {
  assert.throws(
    () => evaluateFixedWindowRateLimit({
      count: -1,
      windowStartedAt: new Date("2026-11-06T10:00:00.000Z"),
      now: new Date("2026-11-06T10:00:30.000Z"),
      windowMs: 60_000,
      maxEvents: 20,
    }),
    { name: "TypeError" },
  );
  assert.throws(
    () => evaluateFixedWindowRateLimit({
      count: 1.5,
      windowStartedAt: new Date("2026-11-06T10:00:00.000Z"),
      now: new Date("2026-11-06T10:00:30.000Z"),
      windowMs: 60_000,
      maxEvents: 20,
    }),
    { name: "TypeError" },
  );
  assert.throws(
    () => evaluateFixedWindowRateLimit({
      count: 1,
      windowStartedAt: new Date("invalid"),
      now: new Date("2026-11-06T10:00:30.000Z"),
      windowMs: 60_000,
      maxEvents: 20,
    }),
    { name: "TypeError" },
  );
});


test("activity buckets keep one metric per chart and use daily points for 7/30 days", () => {
  const daily = [
    { date: "2026-11-01", sourceOpens: 2, codeCopies: 1, verifiedLikes: 3, verifiedUnlikes: 1, anonymousLikes: 4, anonymousUnlikes: 2 },
    { date: "2026-11-02", sourceOpens: 0, codeCopies: 2, verifiedLikes: 0, verifiedUnlikes: 0, anonymousLikes: 1, anonymousUnlikes: 0 },
  ];

  const buckets = buildActivityBuckets({ daily, metric: "verifiedLikes", periodDays: 7 });

  assert.deepEqual(buckets, [
    { key: "2026-11-01", startDate: "2026-11-01", endDate: "2026-11-01", label: "01 Nov", value: 3 },
    { key: "2026-11-02", startDate: "2026-11-02", endDate: "2026-11-02", label: "02 Nov", value: 0 },
  ]);
  assert.equal(buckets.reduce((sum, item) => sum + item.value, 0), 3);
});

test("activity buckets group long ranges into Monday-Sunday UTC weeks and preserve partial weeks", () => {
  const daily = [
    { date: "2026-10-30", sourceOpens: 1 },
    { date: "2026-10-31", sourceOpens: 2 },
    { date: "2026-11-01", sourceOpens: 3 },
    { date: "2026-11-02", sourceOpens: 4 },
    { date: "2026-11-03", sourceOpens: 5 },
    { date: "2026-11-09", sourceOpens: 6 },
  ];

  const buckets = buildActivityBuckets({ daily, metric: "sourceOpens", periodDays: 90 });

  assert.deepEqual(buckets, [
    { key: "2026-10-26", startDate: "2026-10-30", endDate: "2026-11-01", value: 6, label: "30 Oct – 01 Nov" },
    { key: "2026-11-02", startDate: "2026-11-02", endDate: "2026-11-03", value: 9, label: "02 Nov – 03 Nov" },
    { key: "2026-11-09", startDate: "2026-11-09", endDate: "2026-11-09", value: 6, label: "09 Nov" },
  ]);
  assert.equal(buckets.reduce((sum, item) => sum + item.value, 0), 21);
});

test("activity buckets reject duplicate, out-of-order and invalid values", () => {
  assert.throws(
    () => buildActivityBuckets({
      metric: "sourceOpens",
      periodDays: 7,
      daily: [
        { date: "2026-11-02", sourceOpens: 1 },
        { date: "2026-11-02", sourceOpens: 2 },
      ],
    }),
    { name: "RangeError" },
  );
  assert.throws(
    () => buildActivityBuckets({
      metric: "sourceOpens",
      periodDays: 7,
      daily: [{ date: "2026-11-02", sourceOpens: -1 }],
    }),
    { name: "TypeError" },
  );
  assert.throws(
    () => buildActivityBuckets({
      metric: "not-a-metric",
      periodDays: 7,
      daily: [{ date: "2026-11-02", sourceOpens: 1 }],
    }),
    { name: "TypeError" },
  );
});


test("analytics hides only selected experiment rows without mutating source catalogue records", () => {
  const sourceManagedExperiments = [
    { slug: "current-one", title: "Current One" },
    { slug: "current-two", title: "Current Two" },
    { slug: "current-three", title: "Current Three" },
  ];

  const visible = filterVisibleAnalyticsExperiments(sourceManagedExperiments, [
    "current-two",
    "../invalid",
    null,
  ]);

  assert.deepEqual(
    visible.map((experiment) => experiment.slug),
    ["current-one", "current-three"],
  );
  assert.equal(sourceManagedExperiments.length, 3);
  assert.equal(sourceManagedExperiments[1].slug, "current-two");
});

test("owner analytics is sourced from source-managed ready publications and scopes every metric to visible slugs", async () => {
  const analytics = await readFile(
    new URL("../src/app/lib/labs/owner-analytics.js", import.meta.url),
    "utf8",
  );
  const hiddenModel = await readFile(
    new URL("../src/app/lib/labs/models/LabAnalyticsHiddenExperiment.js", import.meta.url),
    "utf8",
  );
  const route = await readFile(
    new URL("../src/app/api/v1/admin/labs/analytics/[slug]/route.js", import.meta.url),
    "utf8",
  );
  const dashboard = await readFile(
    new URL("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js", import.meta.url),
    "utf8",
  );

  assert.ok(analytics.includes("getPublishedCustomLabExperiments()"));
  assert.equal(analytics.includes("publishedLabExperiments"), false);
  assert.ok(analytics.includes("filterVisibleAnalyticsExperiments(customExperiments, hiddenSlugs)"));
  assert.ok(analytics.includes("experimentSlug: { $in: visibleSlugs }"));
  assert.ok(analytics.includes("LabAnalyticsHiddenExperiment.createIndexes()"));
  assert.ok(analytics.includes("hiddenExperiments: hiddenRecords.map"));
  assert.ok(hiddenModel.includes('collection: "lab_analytics_hidden_experiments"'));
  assert.ok(hiddenModel.includes("lab_analytics_hidden_experiment_slug_unique"));
  assert.ok(route.includes("export async function DELETE"));
  assert.ok(route.includes("export async function POST"));
  assert.ok(route.includes("isSameOriginMutation(request)"));
  assert.ok(route.includes("hideLabsOwnerExperimentFromAnalytics"));
  assert.ok(route.includes("restoreLabsOwnerExperimentAnalytics"));
  assert.ok(dashboard.includes("Remove from analytics only"));
  assert.ok(dashboard.includes("restoreExperimentAnalytics"));
  assert.ok(dashboard.includes("Hidden from analytics"));
  assert.ok(dashboard.includes("Source Management record"));
  assert.ok(dashboard.includes('method: "DELETE"'));
  assert.ok(dashboard.includes('method: "POST"'));
});

test("component-copy activity is chartable separately from individual file copies", () => {
  const buckets = buildActivityBuckets({
    daily: [
      { date: "2026-11-01", codeCopies: 4, componentCopies: 1 },
      { date: "2026-11-02", codeCopies: 2, componentCopies: 0 },
    ],
    metric: "componentCopies",
    periodDays: 7,
  });

  assert.deepEqual(buckets.map((bucket) => bucket.value), [1, 0]);
});
