import "server-only";

import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabLike from "./models/LabLike";
import LabGuestLike from "./models/LabGuestLike";
import LabAnalyticsEvent from "./models/LabAnalyticsEvent";
import LabComponentCopyProgress from "./models/LabComponentCopyProgress";
import { normalizeComponentBundleFilePaths, hasCompletedComponentBundle } from "./component-copy-utils.mjs";
import { LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL } from "./analytics-owner.mjs";
import {
  evaluateFixedWindowRateLimit,
  getSourceEventRateLimit,
} from "./owner-analytics-utils.mjs";

export const LABS_GUEST_LIKE_COOKIE = "labs_guest_like";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE * 1000;
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

function getGuestSecret() {
  return process.env.BETTER_AUTH_SECRET || null;
}

function signGuestId(id, secret) {
  return createHmac("sha256", secret).update("labs-guest-like:" + id).digest("hex");
}

function hashGuestId(id, secret) {
  return createHmac("sha256", secret).update("labs-guest-analytics:" + id).digest("hex");
}

export function createGuestIdentity() {
  const secret = getGuestSecret();
  if (!secret) throw new Error("Guest-like signing is not configured.");

  const id = randomUUID();
  const signature = signGuestId(id, secret);

  return {
    token: id + "." + signature,
    guestKeyHash: hashGuestId(id, secret),
  };
}

export function resolveGuestIdentity(request) {
  const secret = getGuestSecret();
  if (!secret) throw new Error("Guest-like signing is not configured.");

  const raw = request.cookies?.get?.(LABS_GUEST_LIKE_COOKIE)?.value || "";
  const separator = raw.indexOf(".");
  const id = separator > 0 ? raw.slice(0, separator) : "";
  const signature = separator > 0 ? raw.slice(separator + 1) : "";
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const isHexSignature = /^[0-9a-f]{64}$/i.test(signature);

  if (isUuid && isHexSignature) {
    const expected = signGuestId(id, secret);
    const receivedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      receivedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      // Return the existing signed token so the API can refresh its rolling
      // cookie expiry after the visitor has chosen to use the like feature.
      return {
        token: raw,
        guestKeyHash: hashGuestId(id, secret),
      };
    }
  }

  return createGuestIdentity();
}

export function setGuestIdentityCookie(response, token) {
  if (!token) return response;

  response.cookies.set({
    name: LABS_GUEST_LIKE_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

export function clearGuestIdentityCookie(response) {
  response.cookies.set({
    name: LABS_GUEST_LIKE_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

let engagementIndexesPromise;

async function ensureEngagementIndexes() {
  if (!engagementIndexesPromise) {
    engagementIndexesPromise = Promise.all([
      LabLike.createIndexes(),
      LabGuestLike.createIndexes(),
      LabAnalyticsEvent.createIndexes(),
      LabComponentCopyProgress.createIndexes(),
    ]).catch((error) => {
      engagementIndexesPromise = null;
      throw error;
    });
  }

  await engagementIndexesPromise;
}

let excludedOwnerUserIdPromise = null;

export async function getLabsAnalyticsExcludedOwnerUserId() {
  const configuredId = process.env.LABS_OWNER_USER_ID?.trim();
  if (configuredId) return configuredId;

  if (!excludedOwnerUserIdPromise) {
    excludedOwnerUserIdPromise = (async () => {
      await connectToDatabase();
      const owner = await mongoose.connection.db.collection("user").findOne(
        {
          email: LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL,
          emailVerified: true,
        },
        { projection: { id: 1 } },
      );

      const id = typeof owner?.id === "string" && owner.id.trim()
        ? owner.id.trim()
        : owner?._id
          ? String(owner._id)
          : null;

      return id && id.length <= 128 ? id : null;
    })().catch((error) => {
      excludedOwnerUserIdPromise = null;
      throw error;
    });
  }

  return excludedOwnerUserIdPromise;
}

async function recordComponentBundleProgress({
  userId,
  slug,
  sourceVersion,
  sourceVersionId,
  filePath,
  requiredFilePaths,
}) {
  const requiredPaths = normalizeComponentBundleFilePaths(requiredFilePaths);
  if (!requiredPaths.includes(filePath)) {
    throw new TypeError("Copied file is not part of the published component bundle.");
  }

  const manifestHash = createHash("sha256")
    .update(requiredPaths.join("\n"))
    .digest("hex");

  // Carry valid pre-existing per-file copy events forward, so deploying this
  // feature does not force a visitor to recopy files already copied in this
  // same published version.
  const previousPaths = await LabAnalyticsEvent.distinct("filePath", {
    actorUserId: userId,
    experimentSlug: slug,
    eventType: "code_copy",
    sourceVersion,
    filePath: { $in: requiredPaths },
    $or: [
      { sourceVersionId },
      { sourceVersionId: null },
      { sourceVersionId: { $exists: false } },
    ],
  });

  const copiedPaths = [...new Set([
    ...(Array.isArray(previousPaths) ? previousPaths : []),
    filePath,
  ])].filter((path) => requiredPaths.includes(path));

  const progress = await LabComponentCopyProgress.findOneAndUpdate(
    { userId, experimentSlug: slug, sourceVersionId },
    {
      $setOnInsert: {
        userId,
        experimentSlug: slug,
        sourceVersionId,
        sourceVersion,
        manifestHash,
        requiredFilePaths: requiredPaths,
      },
      $addToSet: { copiedFilePaths: { $each: copiedPaths } },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!progress || progress.manifestHash !== manifestHash) {
    const error = new Error("The published component manifest changed. Reload the source before copying.");
    error.code = "COMPONENT_MANIFEST_CHANGED";
    throw error;
  }

  if (!hasCompletedComponentBundle(requiredPaths, progress.copiedFilePaths)) {
    return { completed: false, copiedFiles: progress.copiedFilePaths.length, requiredFiles: requiredPaths.length };
  }

  const completedAt = progress.completedAt || new Date();
  const completionKey = createHash("sha256")
    .update(userId)
    .update("\n")
    .update(slug)
    .update("\n")
    .update(sourceVersionId)
    .digest("hex");
  const eventId = "component_" + completionKey;

  // A deterministic event ID plus the unique eventId index guarantees one
  // component completion per account, experiment, and published version,
  // including concurrent requests and retries.
  await LabAnalyticsEvent.updateOne(
    { eventId },
    {
      $setOnInsert: {
        eventId,
        eventType: "component_copy",
        experimentSlug: slug,
        actorCategory: "verified_user",
        actorUserId: userId,
        sourceVersion,
        sourceVersionId,
        filePath: null,
        occurredAt: completedAt,
      },
    },
    { upsert: true, runValidators: true },
  );

  if (!progress.completedAt) {
    await LabComponentCopyProgress.updateOne(
      { _id: progress._id, completedAt: null },
      { $set: { completedAt } },
    );
  }

  return { completed: true, copiedFiles: requiredPaths.length, requiredFiles: requiredPaths.length };
}

/**
 * Migrate active anonymous likes into the verified account when the visitor
 * signs in on the same browser profile. The historical event remains
 * attributed to the guest; this operation changes current state only and
 * deliberately does not synthesize a verified "like" event.
 *
 * Anonymous identity is browser-cookie based, not a claim about a natural
 * person. Cookie-cleared/private sessions remain separate anonymous actors.
 */
export async function mergeGuestLikesIntoVerifiedAccount({ guestKeyHash, userId }) {
  if (
    typeof guestKeyHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(guestKeyHash) ||
    typeof userId !== "string" ||
    !userId.trim() ||
    userId.length > 128
  ) {
    return { migratedCount: 0 };
  }

  await connectToDatabase();
  await ensureEngagementIndexes();

  if (userId === await getLabsAnalyticsExcludedOwnerUserId()) {
    return { migratedCount: 0, excluded: true };
  }

  const now = new Date();
  const session = await mongoose.startSession();
  let migratedCount = 0;

  try {
    await session.withTransaction(async () => {
      const guestLikes = await LabGuestLike.find({
        guestKeyHash,
        active: true,
        expiresAt: { $gt: now },
      })
        .select("experimentSlug lastTransitionAt createdAt")
        .session(session)
        .lean();

      for (const guestLike of guestLikes) {
        const existing = await LabLike.findOne({
          userId,
          experimentSlug: guestLike.experimentSlug,
        })
          .session(session)
          .lean();

        if (!existing) {
          await LabLike.create(
            [{
              userId,
              experimentSlug: guestLike.experimentSlug,
              active: true,
              lastTransitionAt: guestLike.lastTransitionAt || now,
              createdAt: guestLike.createdAt || now,
              updatedAt: now,
            }],
            { session },
          );
        } else if (existing.active !== true) {
          await LabLike.updateOne(
            { _id: existing._id, active: false },
            {
              $set: {
                active: true,
                lastTransitionAt: guestLike.lastTransitionAt || now,
              },
            },
            { session },
          );
        }

        const deactivated = await LabGuestLike.updateOne(
          { _id: guestLike._id, active: true },
          {
            $set: {
              active: false,
              lastTransitionAt: now,
              expiresAt: now,
            },
          },
          { session },
        );
        migratedCount += deactivated.modifiedCount;
      }
    });
  } finally {
    await session.endSession();
  }

  return { migratedCount };
}

export async function getLabEngagement({ slug, actor, excludedUserId: suppliedExcludedUserId = null }) {
  await connectToDatabase();
  await ensureEngagementIndexes();

  const now = new Date();
  const excludedUserId = suppliedExcludedUserId ||
    await getLabsAnalyticsExcludedOwnerUserId();
  const safeActor = actor?.type === "verified" && actor.userId === excludedUserId
    ? null
    : actor;

  if (safeActor?.type === "guest") {
    const rollingExpiry = new Date(now.getTime() + COOKIE_MAX_AGE_MS);
    await LabGuestLike.updateMany(
      {
        guestKeyHash: actor.guestKeyHash,
        active: true,
      },
      { $set: { expiresAt: rollingExpiry } },
    );
  }

  const verifiedLikeFilter = { experimentSlug: slug, active: true };
  if (excludedUserId) verifiedLikeFilter.userId = { $ne: excludedUserId };

  const [verifiedLikes, anonymousLikes, actorLike] = await Promise.all([
    LabLike.countDocuments(verifiedLikeFilter),
    LabGuestLike.countDocuments({
      experimentSlug: slug,
      active: true,
      expiresAt: { $gt: now },
    }),
    safeActor?.type === "verified"
      ? LabLike.findOne({
          userId: safeActor.userId,
          experimentSlug: slug,
          active: true,
        }).select("_id").lean()
      : safeActor?.type === "guest"
        ? LabGuestLike.findOne({
            guestKeyHash: safeActor.guestKeyHash,
            experimentSlug: slug,
            active: true,
            expiresAt: { $gt: now },
          }).select("_id").lean()
        : null,
  ]);

  return {
    verifiedLikes,
    anonymousLikes,
    totalLikes: verifiedLikes + anonymousLikes,
    liked: Boolean(actorLike),
    ownerExcluded: actor?.type === "verified" && !safeActor,
  };
}

export async function setLabLike({ slug, actor, liked }) {
  await connectToDatabase();
  await ensureEngagementIndexes();

  if (actor?.type === "verified" && actor.userId === await getLabsAnalyticsExcludedOwnerUserId()) {
    return {
      ...(await getLabEngagement({ slug, actor: null })),
      transitioned: false,
      rateLimited: false,
      excluded: true,
    };
  }

  const now = new Date();
  const isVerified = actor.type === "verified";
  const Model = isVerified ? LabLike : LabGuestLike;
  const identityField = isVerified ? "userId" : "guestKeyHash";
  const identityValue = isVerified ? actor.userId : actor.guestKeyHash;
  const eventType = isVerified
    ? liked ? "like" : "unlike"
    : liked ? "guest_like" : "guest_unlike";

  let transitioned = false;
  let rateLimited = false;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const currentState = await Model.findOne({
        [identityField]: identityValue,
        experimentSlug: slug,
      })
        .select("lastTransitionAt")
        .session(session)
        .lean();

      if (
        currentState?.lastTransitionAt &&
        now.getTime() - new Date(currentState.lastTransitionAt).getTime() < 1000
      ) {
        rateLimited = true;
        return;
      }

      if (liked) {
        const update = {
          $set: { active: true, lastTransitionAt: now },
          $setOnInsert: {
            [identityField]: identityValue,
            experimentSlug: slug,
          },
        };

        if (!isVerified) {
          update.$set.expiresAt = new Date(now.getTime() + COOKIE_MAX_AGE_MS);
        }

        const result = await Model.updateOne(
          {
            [identityField]: identityValue,
            experimentSlug: slug,
            active: { $ne: true },
          },
          update,
          { upsert: true, runValidators: true, session },
        );

        transitioned = result.modifiedCount > 0 || result.upsertedCount > 0;
      } else {
        const update = {
          $set: { active: false, lastTransitionAt: now },
        };

        if (!isVerified) {
          update.$set.expiresAt = new Date(now.getTime() + COOKIE_MAX_AGE_MS);
        }

        const result = await Model.updateOne(
          {
            [identityField]: identityValue,
            experimentSlug: slug,
            active: true,
          },
          update,
          { runValidators: true, session },
        );

        transitioned = result.modifiedCount > 0;
      }

      if (transitioned) {
        await LabAnalyticsEvent.create(
          [{
            eventId: randomUUID(),
            eventType,
            experimentSlug: slug,
            actorCategory: isVerified ? "verified_user" : "guest",
            actorUserId: isVerified ? actor.userId : null,
            occurredAt: now,
          }],
          { session },
        );
      }
    });
  } catch (error) {
    // A concurrent request may win the unique user/browser + experiment
    // index. The winning state is returned below without double-counting.
    if (error?.code !== 11000) throw error;
    transitioned = false;
  } finally {
    await session.endSession();
  }

  return {
    ...(await getLabEngagement({ slug, actor })),
    transitioned,
    rateLimited,
  };
}

const SOURCE_EVENT_RATE_WINDOW_MS = 60 * 1000;
async function consumeSourceEventRateLimit({ userId, eventType }) {
  const maxEvents = getSourceEventRateLimit(eventType);
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!maxEvents || !secret) {
    throw new Error("Source event rate limiting is not configured.");
  }

  const key = createHmac("sha256", secret)
    .update("labs-source-event:" + userId + ":" + eventType)
    .digest("hex");

  const now = new Date();
  const cutoff = new Date(now.getTime() - SOURCE_EVENT_RATE_WINDOW_MS);
  const collection = mongoose.connection.db.collection("lab_source_event_limits");

  globalThis.__labsSourceEventLimitIndexPromise ||= collection
    .createIndex(
      { updatedAt: 1 },
      {
        expireAfterSeconds: 24 * 60 * 60,
        name: "lab_source_event_limit_ttl",
      },
    )
    .catch((error) => {
      globalThis.__labsSourceEventLimitIndexPromise = null;
      throw error;
    });
  await globalThis.__labsSourceEventLimitIndexPromise;

  const result = await collection.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          windowStartedAt: {
            $cond: [
              { $gt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff] },
              "$windowStartedAt",
              now,
            ],
          },
          count: {
            $cond: [
              { $gt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff] },
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
              1,
            ],
          },
          updatedAt: now,
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );

  const document = result?.value ?? result;

  return evaluateFixedWindowRateLimit({
    count: document?.count || 0,
    windowStartedAt: document?.windowStartedAt || now,
    now,
    windowMs: SOURCE_EVENT_RATE_WINDOW_MS,
    maxEvents,
  });
}

export async function recordVerifiedSourceEvent({
  eventType,
  slug,
  userId,
  sourceVersion,
  sourceVersionId = null,
  filePath = null,
  requiredFilePaths = null,
  eventId,
}) {
  if (!["source_open", "code_copy"].includes(eventType)) {
    throw new TypeError("Unsupported source analytics event.");
  }

  const safeEventId =
    typeof eventId === "string" && EVENT_ID_PATTERN.test(eventId)
      ? eventId
      : randomUUID();

  await connectToDatabase();
  await ensureEngagementIndexes();

  // A replay of an already accepted idempotency key is not a new attempt and
  // must not consume the account's source-event quota.
  const existingEvent = await LabAnalyticsEvent.exists({ eventId: safeEventId });
  if (existingEvent) {
    const component = eventType === "code_copy" && Array.isArray(requiredFilePaths)
      ? await recordComponentBundleProgress({
          userId,
          slug,
          sourceVersion,
          sourceVersionId: String(sourceVersionId || slug + ":" + sourceVersion),
          filePath,
          requiredFilePaths,
        })
      : null;
    return { recorded: false, duplicate: true, component };
  }

  const rateLimit = await consumeSourceEventRateLimit({ userId, eventType });
  if (!rateLimit.allowed) {
    return {
      recorded: false,
      rateLimited: true,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  try {
    await LabAnalyticsEvent.create({
      eventId: safeEventId,
      eventType,
      experimentSlug: slug,
      actorCategory: "verified_user",
      actorUserId: userId,
      sourceVersion: sourceVersion || null,
      sourceVersionId: sourceVersionId ? String(sourceVersionId) : null,
      filePath: filePath || null,
      occurredAt: new Date(),
    });
    const component = eventType === "code_copy" && Array.isArray(requiredFilePaths)
      ? await recordComponentBundleProgress({
          userId,
          slug,
          sourceVersion,
          sourceVersionId: String(sourceVersionId || slug + ":" + sourceVersion),
          filePath,
          requiredFilePaths,
        })
      : null;

    return {
      recorded: true,
      rateLimitRemaining: rateLimit.remaining,
      component,
    };
  } catch (error) {
    if (error?.code === 11000) return { recorded: false, duplicate: true };
    throw error;
  }
}

/**
 * Read engagement for a gallery in a small number of indexed queries.
 * This avoids one GET request per card while keeping each visitor's liked
 * state private to the response that is rendered for that visitor.
 */
export async function getLabEngagementBatch({ slugs, actor = null }) {
  const uniqueSlugs = [...new Set(
    (Array.isArray(slugs) ? slugs : [])
      .filter((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)),
  )].slice(0, 100);

  if (!uniqueSlugs.length) return {};

  await connectToDatabase();
  await ensureEngagementIndexes();

  const now = new Date();
  const excludedUserId = await getLabsAnalyticsExcludedOwnerUserId();
  const safeActor = actor?.type === "verified" && actor.userId === excludedUserId
    ? null
    : actor;
  const matchSlugs = { $in: uniqueSlugs };
  const verifiedLikeFilter = { experimentSlug: matchSlugs, active: true };
  if (excludedUserId) verifiedLikeFilter.userId = { $ne: excludedUserId };

  if (safeActor?.type === "guest") {
    await LabGuestLike.updateMany(
      {
        guestKeyHash: actor.guestKeyHash,
        experimentSlug: matchSlugs,
        active: true,
      },
      { $set: { expiresAt: new Date(now.getTime() + COOKIE_MAX_AGE_MS) } },
    );
  }

  const [verifiedCounts, guestCounts, actorRows] = await Promise.all([
    LabLike.aggregate([
      { $match: verifiedLikeFilter },
      { $group: { _id: "$experimentSlug", count: { $sum: 1 } } },
    ]),
    LabGuestLike.aggregate([
      {
        $match: {
          experimentSlug: matchSlugs,
          active: true,
          expiresAt: { $gt: now },
        },
      },
      { $group: { _id: "$experimentSlug", count: { $sum: 1 } } },
    ]),
    safeActor?.type === "verified"
      ? LabLike.find({
          userId: safeActor.userId,
          experimentSlug: matchSlugs,
          active: true,
        }).select("experimentSlug").lean()
      : safeActor?.type === "guest"
        ? LabGuestLike.find({
            guestKeyHash: safeActor.guestKeyHash,
            experimentSlug: matchSlugs,
            active: true,
            expiresAt: { $gt: now },
          }).select("experimentSlug").lean()
        : Promise.resolve([]),
  ]);

  const verifiedBySlug = new Map(verifiedCounts.map((item) => [item._id, item.count]));
  const guestBySlug = new Map(guestCounts.map((item) => [item._id, item.count]));
  const likedSlugs = new Set(actorRows.map((item) => item.experimentSlug));

  return Object.fromEntries(uniqueSlugs.map((slug) => {
    const verifiedLikes = verifiedBySlug.get(slug) || 0;
    const anonymousLikes = guestBySlug.get(slug) || 0;

    return [
      slug,
      {
        verifiedLikes,
        anonymousLikes,
        totalLikes: verifiedLikes + anonymousLikes,
        liked: likedSlugs.has(slug),
      },
    ];
  }));
}

/**
 * Build the visitor-scoped engagement DTO for server-rendered Labs surfaces.
 * Only aggregate counts and the current actor's own liked state are returned.
 */
export async function getLabEngagementSnapshot({
  slugs,
  session = null,
  guestCookieValue = "",
}) {
  const isVerified = Boolean(session?.user?.id && session.user.emailVerified === true);
  const isUnverified = Boolean(session?.user?.id && session.user.emailVerified !== true);
  let actor = isVerified ? { type: "verified", userId: session.user.id } : null;

  if (isVerified && typeof guestCookieValue === "string" && guestCookieValue) {
    const guestIdentity = resolveGuestIdentity({
      cookies: {
        get: (name) => name === LABS_GUEST_LIKE_COOKIE ? { value: guestCookieValue } : undefined,
      },
    });
    await mergeGuestLikesIntoVerifiedAccount({
      guestKeyHash: guestIdentity.guestKeyHash,
      userId: session.user.id,
    });
  }

  if (!session?.user?.id && typeof guestCookieValue === "string" && guestCookieValue) {
    const identity = resolveGuestIdentity({
      cookies: {
        get: (name) => name === LABS_GUEST_LIKE_COOKIE ? { value: guestCookieValue } : undefined,
      },
    });
    actor = { type: "guest", guestKeyHash: identity.guestKeyHash };
  }

  const engagementBySlug = await getLabEngagementBatch({ slugs, actor });
  const uniqueSlugs = [...new Set(
    (Array.isArray(slugs) ? slugs : [])
      .filter((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)),
  )].slice(0, 100);

  return Object.fromEntries(uniqueSlugs.map((slug) => [
    slug,
    {
      // Public surfaces receive only the combined count. Actor breakdown is
      // deliberately kept inside the owner-only analytics repository.
      totalLikes: engagementBySlug[slug]?.totalLikes || 0,
      liked: engagementBySlug[slug]?.liked === true,
      likeAllowed: !session?.user?.id || isVerified,
      actorType: isVerified ? "verified_user" : isUnverified ? "unverified" : "guest",
      // A verified page can clear the consumed browser cookie through the
      // engagement GET route after this server snapshot has migrated state.
      guestCookieCleanupRequired: isVerified && Boolean(guestCookieValue),
    },
  ]));
}
