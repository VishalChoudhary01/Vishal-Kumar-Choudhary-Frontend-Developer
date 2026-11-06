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
