import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { publishedLabExperiments } from "@/app/data/labsExperiments";
import { getPublishedCustomLabExperiments } from "./public-experiments";
import LabAnalyticsEvent from "./models/LabAnalyticsEvent";
import LabLike from "./models/LabLike";
import LabGuestLike from "./models/LabGuestLike";
import { isLabsOwner } from "./owner-access";
import {
  applyActiveLikeGroups,
  applyAnalyticsEventGroups,
  buildCompleteDailySeries,
  createRankings,
  normalizePeriod,
  summarizeAnalyticsRows,
} from "./owner-analytics-utils.mjs";

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

export async function getLabsOwnerAnalytics({ user, days = 30 }) {
  if (!isLabsOwner(user)) {
    const error = new Error("Owner access is required.");
    error.code = "OWNER_ACCESS_DENIED";
    throw error;
  }

  const { periodDays, generatedAt, since } = normalizePeriod(days);

  await connectToDatabase();
  await ensureIndexes();

  const [eventGroups, verifiedLikeGroups, guestLikeGroups, dailyGroups, customExperiments] =
    await Promise.all([
      LabAnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: since, $lte: generatedAt } } },
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
            verifiedLikes: {
              $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "verified_user"] }, { $eq: ["$eventType", "like"] }] }, 1, 0] },
            },
            verifiedUnlikes: {
              $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "verified_user"] }, { $eq: ["$eventType", "unlike"] }] }, 1, 0] },
            },
            anonymousLikes: {
              $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "guest"] }, { $eq: ["$eventType", "guest_like"] }] }, 1, 0] },
            },
            anonymousUnlikes: {
              $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "guest"] }, { $eq: ["$eventType", "guest_unlike"] }] }, 1, 0] },
            },
            verifiedLikeActions: {
              $sum: { $cond: [{ $in: ["$eventType", ["like", "unlike"]] }, 1, 0] },
            },
            anonymousLikeActions: {
              $sum: { $cond: [{ $in: ["$eventType", ["guest_like", "guest_unlike"]] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      getPublishedCustomLabExperiments(),
    ]);

  const experimentRows = createExperimentRows([
    ...publishedLabExperiments,
    ...customExperiments,
  ]);
  const eventRows = applyAnalyticsEventGroups(experimentRows, eventGroups);
  const rowsWithLikes = applyActiveLikeGroups(
    eventRows,
    verifiedLikeGroups,
    guestLikeGroups,
  );
  const rows = rowsWithLikes;
  const totals = summarizeAnalyticsRows(rows);

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
        verifiedLikes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "verified_user"] }, { $eq: ["$eventType", "like"] }] }, 1, 0] },
        },
        verifiedUnlikes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "verified_user"] }, { $eq: ["$eventType", "unlike"] }] }, 1, 0] },
        },
        anonymousLikes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "guest"] }, { $eq: ["$eventType", "guest_like"] }] }, 1, 0] },
        },
        anonymousUnlikes: {
          $sum: { $cond: [{ $and: [{ $eq: ["$actorCategory", "guest"] }, { $eq: ["$eventType", "guest_unlike"] }] }, 1, 0] },
        },
        verifiedLikeActions: {
          $sum: { $cond: [{ $in: ["$eventType", ["like", "unlike"]] }, 1, 0] },
        },
        anonymousLikeActions: {
          $sum: { $cond: [{ $in: ["$eventType", ["guest_like", "guest_unlike"]] }, 1, 0] },
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


function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Owner-only current-state drilldown. Anonymous actors never reach this
 * collection, and raw user IDs are deliberately omitted from the DTO.
 */
export async function getLabsOwnerActiveVerifiedLikes({
  user,
  slug,
  page = 1,
  search = "",
}) {
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

  const safePage = Number.isInteger(Number(page))
    ? Math.max(1, Math.min(100000, Number(page)))
    : 1;
  const safeSearch = typeof search === "string" ? search.trim().slice(0, 80) : "";
  const pageSize = 20;
  const pipeline = [
    { $match: { experimentSlug: slug, active: true } },
    {
      $lookup: {
        from: "user",
        let: { actorId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: [{ $toString: "$_id" }, "$$actorId"] },
                  { $eq: [{ $ifNull: ["$id", ""] }, "$$actorId"] },
                ],
              },
            },
          },
          { $project: { _id: 0, name: 1, email: 1, emailVerified: 1 } },
          { $limit: 1 },
        ],
        as: "account",
      },
    },
    {
      $unwind: {
        path: "$account",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (safeSearch) {
    const expression = new RegExp(escapeRegex(safeSearch), "i");
    pipeline.push({
      $match: {
        $or: [
          { "account.name": expression },
          { "account.email": expression },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { lastTransitionAt: -1, _id: -1 } },
    {
      $facet: {
        items: [
          { $skip: (safePage - 1) * pageSize },
          { $limit: pageSize },
          {
            $project: {
              _id: 0,
              name: {
                $cond: [
                  { $gt: [{ $strLenCP: { $ifNull: ["$account.name", ""] } }, 0] },
                  "$account.name",
                  "Account unavailable",
                ],
              },
              email: { $ifNull: ["$account.email", ""] },
              emailVerified: { $eq: ["$account.emailVerified", true] },
              likedAt: { $ifNull: ["$lastTransitionAt", "$updatedAt"] },
            },
          },
        ],
        totals: [{ $count: "count" }],
      },
    },
  );

  await connectToDatabase();
  await ensureIndexes();
  const [result] = await LabLike.aggregate(pipeline);
  const total = Number(result?.totals?.[0]?.count || 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: Array.isArray(result?.items) ? result.items.map((item) => ({
      name: typeof item.name === "string" ? item.name : "Account unavailable",
      email: typeof item.email === "string" ? item.email : "",
      emailVerified: item.emailVerified === true,
      likedAt: item.likedAt ? new Date(item.likedAt).toISOString() : null,
    })) : [],
    total,
    page: Math.min(safePage, pages),
    pageSize,
    pages,
    search: safeSearch,
  };
}
