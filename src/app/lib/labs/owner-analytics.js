import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { publishedLabExperiments } from "@/app/data/labsExperiments";
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

export async function getLabsOwnerAnalytics({ user, days = 30 }) {
  if (!isLabsOwner(user)) {
    const error = new Error("Owner access is required.");
    error.code = "OWNER_ACCESS_DENIED";
    throw error;
  }

  const allowedDays = new Set([7, 30, 90, 365]);
  const periodDays = allowedDays.has(Number(days)) ? Number(days) : 30;
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  await connectToDatabase();
  await ensureIndexes();

  const [eventGroups, verifiedLikeGroups, guestLikeGroups] = await Promise.all([
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
      { $match: { active: true } },
      { $group: { _id: "$experimentSlug", count: { $sum: 1 } } },
    ]),
  ]);

  const rows = publishedLabExperiments.map((experiment) => ({
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
  }));

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
    generatedAt: new Date().toISOString(),
    totals,
    experiments: rows,
  };
}
