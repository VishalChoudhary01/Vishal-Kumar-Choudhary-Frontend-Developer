import "server-only";

import { createHmac } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";

const WINDOW_MS = 60_000;
const RECORD_TTL_MS = 15 * 60_000;

const SESSION_LIMITS = Object.freeze({
  start: 12,
  heartbeat: 8,
  pause: 20,
  resume: 20,
  end: 20,
});

const IP_LIMITS = Object.freeze({
  start: 40,
  heartbeat: 120,
  pause: 120,
  resume: 120,
  end: 120,
});

function hashKey(secret, scope, value) {
  return createHmac("sha256", secret)
    .update("portfolio-analytics:rate-limit:v1")
    .update("\0")
    .update(scope)
    .update("\0")
    .update(value)
    .digest("hex");
}

function trustedAddress(request) {
  const headerName =
    process.env.AUTH_TRUSTED_IP_HEADER || "x-vercel-forwarded-for";
  const value = request?.headers?.get?.(headerName);

  if (typeof value !== "string" || !value.trim()) return null;

  // The address is used only in this function to derive a short-lived HMAC.
  // Neither the raw address nor the HMAC is stored in the visit collection.
  return value.split(",")[0].trim().slice(0, 128) || null;
}

async function consumeBucket(collection, key, maximum, now) {
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const isCurrentWindow = {
    $gt: [{ $ifNull: ["$windowStartedAt", new Date(0)] }, cutoff],
  };

  const record = await collection.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          windowStartedAt: {
            $cond: [isCurrentWindow, "$windowStartedAt", now],
          },
          count: {
            $cond: [
              isCurrentWindow,
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
              1,
            ],
          },
          expiresAt: new Date(now.getTime() + RECORD_TTL_MS),
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );

  const count = Math.max(0, Number(record?.count) || 0);
  const windowStartedAt = new Date(record?.windowStartedAt || now);

  return {
    allowed: count <= maximum,
    remaining: Math.max(0, maximum - count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil(
        (windowStartedAt.getTime() + WINDOW_MS - now.getTime()) / 1000,
      ),
    ),
  };
}

/**
 * Rate limits each action by tab session, then additionally by the trusted
 * deployment IP header when Vercel supplies it. Only short-lived HMAC keys
 * are kept in the separate rate-limit collection.
 */
export async function consumePortfolioVisitRateLimit({
  request,
  action,
  tabSessionId,
  secret,
  now = new Date(),
}) {
  const sessionMaximum = SESSION_LIMITS[action];
  const ipMaximum = IP_LIMITS[action];

  if (
    !sessionMaximum ||
    !ipMaximum ||
    typeof tabSessionId !== "string" ||
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    const error = new Error("A valid Portfolio Analytics rate-limit policy is required.");
    error.code = "PORTFOLIO_RATE_LIMIT_NOT_CONFIGURED";
    throw error;
  }

  await connectToDatabase();
  const collection = mongoose.connection.db.collection(
    "portfolio_analytics_rate_limits",
  );

  const sessionKey = hashKey(secret, "session:" + action, tabSessionId);
  const sessionResult = await consumeBucket(
    collection,
    sessionKey,
    sessionMaximum,
    now,
  );

  if (!sessionResult.allowed) {
    return { ...sessionResult, scope: "session" };
  }

  const address = trustedAddress(request);
  if (!address) return { ...sessionResult, scope: "session" };

  const ipKey = hashKey(secret, "ip:all", address);
  const ipResult = await consumeBucket(
    collection,
    ipKey,
    180,
    now,
  );

  return ipResult.allowed
    ? { ...ipResult, scope: "ip" }
    : { ...ipResult, scope: "ip" };
}
