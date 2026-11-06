import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCompleteDailySeries,
  createRankings,
  normalizePeriod,
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
      verifiedLikeActions: 2,
      anonymousLikeActions: 4,
      totalActions: 10,
    },
    {
      date: "2026-11-05",
      sourceOpens: 0,
      codeCopies: 0,
      verifiedLikeActions: 0,
      anonymousLikeActions: 0,
      totalActions: 0,
    },
    {
      date: "2026-11-06",
      sourceOpens: 5,
      codeCopies: 2,
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
