import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabLike from "./models/LabLike";
import LabGuestLike from "./models/LabGuestLike";
import LabAnalyticsEvent from "./models/LabAnalyticsEvent";

export const LABS_GUEST_LIKE_COOKIE = "labs_guest_like";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
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
      return {
        token: null,
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

let engagementIndexesPromise;

async function ensureEngagementIndexes() {
  if (!engagementIndexesPromise) {
    engagementIndexesPromise = Promise.all([
      LabLike.createIndexes(),
      LabGuestLike.createIndexes(),
      LabAnalyticsEvent.createIndexes(),
    ]).catch((error) => {
      engagementIndexesPromise = null;
      throw error;
    });
  }

  await engagementIndexesPromise;
}

export async function getLabEngagement({ slug, actor }) {
  await connectToDatabase();
  await ensureEngagementIndexes();

  const [verifiedLikes, anonymousLikes, actorLike] = await Promise.all([
    LabLike.countDocuments({ experimentSlug: slug, active: true }),
    LabGuestLike.countDocuments({ experimentSlug: slug, active: true }),
    actor?.type === "verified"
      ? LabLike.findOne({
          userId: actor.userId,
          experimentSlug: slug,
          active: true,
        }).select("_id").lean()
      : actor?.type === "guest"
        ? LabGuestLike.findOne({
            guestKeyHash: actor.guestKeyHash,
            experimentSlug: slug,
            active: true,
          }).select("_id").lean()
        : null,
  ]);

  return {
    verifiedLikes,
    anonymousLikes,
    totalLikes: verifiedLikes + anonymousLikes,
    liked: Boolean(actorLike),
  };
}

export async function setLabLike({ slug, actor, liked }) {
  await connectToDatabase();
  await ensureEngagementIndexes();

  const now = new Date();
  const isVerified = actor.type === "verified";
  const Model = isVerified ? LabLike : LabGuestLike;
  const identityField = isVerified ? "userId" : "guestKeyHash";
  const identityValue = isVerified ? actor.userId : actor.guestKeyHash;
  const eventType = isVerified
    ? liked ? "like" : "unlike"
    : liked ? "guest_like" : "guest_unlike";

  let transitioned = false;

  if (liked) {
    try {
      const result = await Model.updateOne(
        {
          [identityField]: identityValue,
          experimentSlug: slug,
          active: { $ne: true },
        },
        {
          $set: { active: true, lastTransitionAt: now },
          $setOnInsert: {
            [identityField]: identityValue,
            experimentSlug: slug,
          },
        },
        { upsert: true, runValidators: true },
      );

      transitioned = result.modifiedCount > 0 || result.upsertedCount > 0;
    } catch (error) {
      // A concurrent duplicate like is already represented by the unique key.
      if (error?.code !== 11000) throw error;
    }
  } else {
    const result = await Model.updateOne(
      {
        [identityField]: identityValue,
        experimentSlug: slug,
        active: true,
      },
      { $set: { active: false, lastTransitionAt: now } },
      { runValidators: true },
    );

    transitioned = result.modifiedCount > 0;
  }

  if (transitioned) {
    await LabAnalyticsEvent.create({
      eventId: randomUUID(),
      eventType,
      experimentSlug: slug,
      actorCategory: isVerified ? "verified_user" : "guest",
      actorUserId: isVerified ? actor.userId : null,
      occurredAt: now,
    });
  }

  return {
    ...(await getLabEngagement({ slug, actor })),
    transitioned,
  };
}

export async function recordVerifiedSourceEvent({
  eventType,
  slug,
  userId,
  sourceVersion,
  filePath = null,
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

  try {
    await LabAnalyticsEvent.create({
      eventId: safeEventId,
      eventType,
      experimentSlug: slug,
      actorCategory: "verified_user",
      actorUserId: userId,
      sourceVersion: sourceVersion || null,
      filePath: filePath || null,
      occurredAt: new Date(),
    });
    return { recorded: true };
  } catch (error) {
    if (error?.code === 11000) return { recorded: false, duplicate: true };
    throw error;
  }
}
