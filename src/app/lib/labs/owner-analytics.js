import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { publishedLabExperiments } from "@/app/data/labsExperiments";
import { getPublishedCustomLabExperiments } from "./public-experiments";
import LabAnalyticsEvent from "./models/LabAnalyticsEvent";
import LabLike from "./models/LabLike";
import LabGuestLike from "./models/LabGuestLike";
import { isLabsOwner } from "./owner-access";

let indexPromise;

async function ensureIndexes() {
  if (!indexPromise) {
    indexPromise = Promise.all([
      LabAnalyticsEvent.createIndexes(),
      LabLike.createIndexes(),
      LabGuestLike.createIndexes(),
    ]).catch((error) => {
      indexPromise = null;
      throw error;
    });
  }

  await indexPromise;
}

function createExperimentRows(experiments) {
  const uniqueExperiments = new Map();

  for (const experiment of experiments) {
    if (
      typeof experiment?.slug !== "string" ||
      typeof experiment?.title !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(experiment.slug)
    ) {
      continue;
    }

    // Keep one row per canonical slug. Static, code-owned Labs entries take
    // precedence if a custom record ever collides with a reserved slug.
    if (!uniqueExperiments.has(experiment.slug)) {
      uniqueExperiments.set(experiment.slug, {
        slug: experiment.slug,
        title: experiment.title,
        sourceOpens: 0,
        uniqueVerifiedAccounts: 0,
        codeCopies: 0,
        verifiedLikeActions: 0,
        verifiedUnlikeActions: 0,
        anonymousLikeActions: 0,
        anonymousUnlikeActions: 0,
        activeVerifiedLikes: 0,
        activeAnonymousLikes: 0,
      });
    }
  }

  return [...uniqueExperiments.values()];
}

function createRankings(rows, limit = 5) {
  function rankBy(metric, select) {
    return [...rows]
      .filter((row) => Number(row[metric]) > 0)
      .sort((a, b) => {
        const difference = Number(b[metric]) - Number(a[metric]);
        if (difference !== 0) return difference;
        const titleOrder = a.title.localeCompare(b.title, "en-IN");
        return titleOrder || a.slug.localeCompare(b.slug);
      })
      .slice(0, limit)
      .map((row, index) => ({
        rank: index + 1,
        slug: row.slug,
        title: row.title,
        value: Number(row[metric]) || 0,
        ...select(row),
      }));
  }

  return {
    mostSourceOpens: rankBy("sourceOpens"),
    mostCodeCopies: rankBy("codeCopies"),
    mostActiveLikes: rankBy("totalActiveLikes", (row) => ({
      activeVerifiedLikes: row.activeVerifiedLikes,
      activeAnonymousLikes: row.activeAnonymousLikes,
    })),
  };
}

function normalizePeriod(days) {
  const { periodDays, generatedAt, since } = normalizePeriod(days);
  return { periodDays, generatedAt, since };
}

function toUtcDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function buildCompleteDailySeries({ since, generatedAt, dailyGroups }) {
  const groupsByDate = new Map(dailyGroups.map((day) => [day._id, day]));
  const firstDay = new Date(Date.UTC(
    since.getUTCFullYear(),
    since.getUTCMonth(),
    since.getUTCDate(),
  ));
  const lastDay = new Date(Date.UTC(
    generatedAt.getUTCFullYear(),
    generatedAt.getUTCMonth(),
    generatedAt.getUTCDate(),
  ));
  const days = [];

  for (
    const cursor = new Date(firstDay);
    cursor <= lastDay;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const date = toUtcDateKey(cursor);
    const group = groupsByDate.get(date);

    const sourceOpens = group?.sourceOpens || 0;
    const codeCopies = group?.codeCopies || 0;
    const verifiedLikeActions = group?.verifiedLikeActions || 0;
    const anonymousLikeActions = group?.anonymousLikeActions || 0;

    days.push({
      date,
      sourceOpens,
      codeCopies,
      verifiedLikeActions,
      anonymousLikeActions,
      totalActions:
        sourceOpens +
        codeCopies +
        verifiedLikeActions +
        anonymousLikeActions,
    });
  }

  return days;
}

export async function getLabsOwnerAnalytics({ user, days = 30 }) {
  if (!isLabsOwner(user)) {
    const error = new Error("Owner access is required.");
    error.code = "OWNER_ACCESS_DENIED";
    throw error;
  }

  const allowedDays = new Set([7, 30, 90, 365]);
  const periodDays = allowedDays.has(Number(days)) ? Number(days) : 30;
  const generatedAt = new Date();
  const since = new Date(generatedAt.getTime() - periodDays * 24 * 60 * 60 * 1000);

  await connectToDatabase();
  await ensureIndexes();

  const [eventGroups, verifiedLikeGroups, guestLikeGroups, dailyGroups, customExperiments] =
    await Promise.all([
      LabAnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: since } } },
        {
          $group: {
            _id: {
              slug: "$experimentSlug",
              eventType: "$eventType",
              actorCategory: "$actorCategory",
            },
            count: { $sum: 1 },
            actorIds: { $addToSet: "$actorUserId" },
          },
        },
      ]),
      LabLike.aggregate([
        { $match: { active: true } },
        { $group: { _id: "$experimentSlug", count: { $sum: 1 } } },
      ]),
      LabGuestLike.aggregate([
        { $match: { active: true, expiresAt: { $gt: generatedAt } } },
        { $group: { _id: "$experimentSlug", count: { $sum: 1 } } },
      ]),
      LabAnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: since, $lte: generatedAt } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$occurredAt",
                timezone: "UTC",
              },
            },
            sourceOpens: {
              $sum: { $cond: [{ $eq: ["$eventType", "source_open"] }, 1, 0] },
            },
            codeCopies: {
              $sum: { $cond: [{ $eq: ["$eventType", "code_copy"] }, 1, 0] },
            },
            verifiedLikeActions: {
              $sum: {
                $cond: [
                  { $in: ["$eventType", ["like", "unlike"]] },
                  1,
                  0,
                ],
              },
            },
            anonymousLikeActions: {
              $sum: {
                $cond: [
                  { $in: ["$eventType", ["guest_like", "guest_unlike"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      getPublishedCustomLabExperiments(),
    ]);

  const rows = createExperimentRows([
    ...publishedLabExperiments,
    ...customExperiments,
  ]);
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  for (const group of eventGroups) {
    const row = bySlug.get(group._id.slug);
    if (!row) continue;

    const { eventType, actorCategory } = group._id;
    if (eventType === "source_open" && actorCategory === "verified_user") {
      row.sourceOpens += group.count;
      row.uniqueVerifiedAccounts += (group.actorIds || []).filter(Boolean).length;
    } else if (eventType === "code_copy" && actorCategory === "verified_user") {
      row.codeCopies += group.count;
    } else if (eventType === "like" && actorCategory === "verified_user") {
      row.verifiedLikeActions += group.count;
    } else if (eventType === "unlike" && actorCategory === "verified_user") {
      row.verifiedUnlikeActions += group.count;
    } else if (eventType === "guest_like" && actorCategory === "guest") {
      row.anonymousLikeActions += group.count;
    } else if (eventType === "guest_unlike" && actorCategory === "guest") {
      row.anonymousUnlikeActions += group.count;
    }
  }

  for (const group of verifiedLikeGroups) {
    const row = bySlug.get(group._id);
    if (row) row.activeVerifiedLikes = group.count;
  }

  for (const group of guestLikeGroups) {
    const row = bySlug.get(group._id);
    if (row) row.activeAnonymousLikes = group.count;
  }

  for (const row of rows) {
    row.totalActiveLikes = row.activeVerifiedLikes + row.activeAnonymousLikes;
  }

  const totals = rows.reduce(
    (total, row) => {
      total.sourceOpens += row.sourceOpens;
      // This is the sum of distinct accounts per experiment, not a globally
      // deduplicated count of accounts across every experiment.
      total.uniqueVerifiedAccounts += row.uniqueVerifiedAccounts;
      total.codeCopies += row.codeCopies;
      total.verifiedLikeActions += row.verifiedLikeActions;
      total.verifiedUnlikeActions += row.verifiedUnlikeActions;
      total.anonymousLikeActions += row.anonymousLikeActions;
      total.anonymousUnlikeActions += row.anonymousUnlikeActions;
      total.activeVerifiedLikes += row.activeVerifiedLikes;
      total.activeAnonymousLikes += row.activeAnonymousLikes;
      total.totalActiveLikes += row.totalActiveLikes;
      return total;
    },
    {
      sourceOpens: 0,
      uniqueVerifiedAccounts: 0,
      codeCopies: 0,
      verifiedLikeActions: 0,
      verifiedUnlikeActions: 0,
      anonymousLikeActions: 0,
      anonymousUnlikeActions: 0,
      activeVerifiedLikes: 0,
      activeAnonymousLikes: 0,
      totalActiveLikes: 0,
    },
  );

  return {
    periodDays,
    since: since.toISOString(),
    generatedAt: generatedAt.toISOString(),
    totals,
    daily: buildCompleteDailySeries({ since, generatedAt, dailyGroups }),
    experiments: rows,
    rankings: createRankings(rows),
  };
}


export async function getLabsOwnerExperimentAnalytics({ user, slug, days = 30 }) {
  if (!isLabsOwner(user)) {
    const error = new Error("Owner access is required.");
    error.code = "OWNER_ACCESS_DENIED";
    throw error;
  }

  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    const error = new Error("Experiment not found.");
    error.code = "NOT_FOUND";
    throw error;
  }

  const collection = await getLabsOwnerAnalytics({ user, days });
  const experiment = collection.experiments.find((item) => item.slug === slug);
  if (!experiment) {
    const error = new Error("Experiment not found.");
    error.code = "NOT_FOUND";
    throw error;
  }

  const since = new Date(collection.since);
  const generatedAt = new Date(collection.generatedAt);
  const dailyGroups = await LabAnalyticsEvent.aggregate([
    {
      $match: {
        experimentSlug: slug,
        occurredAt: { $gte: since, $lte: generatedAt },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$occurredAt",
            timezone: "UTC",
          },
        },
        sourceOpens: {
          $sum: { $cond: [{ $eq: ["$eventType", "source_open"] }, 1, 0] },
        },
        codeCopies: {
          $sum: { $cond: [{ $eq: ["$eventType", "code_copy"] }, 1, 0] },
        },
        verifiedLikeActions: {
          $sum: {
            $cond: [
              { $in: ["$eventType", ["like", "unlike"]] },
              1,
              0,
            ],
          },
        },
        anonymousLikeActions: {
          $sum: {
            $cond: [
              { $in: ["$eventType", ["guest_like", "guest_unlike"]] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    periodDays: collection.periodDays,
    since: collection.since,
    generatedAt: collection.generatedAt,
    experiment,
    daily: buildCompleteDailySeries({ since, generatedAt, dailyGroups }),
  };
}
