import "server-only";

import { createHmac } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";

const WINDOW_MS = 60 * 1000;
const MAX_REGISTRATIONS_PER_WINDOW = 5;

function getRequestAddress(request) {
  const trustedHeader =
    process.env.AUTH_TRUSTED_IP_HEADER || "x-vercel-forwarded-for";
  const address = request.headers.get(trustedHeader)?.split(",")[0]?.trim();

  // Do not trust a browser-supplied X-Forwarded-For value. If the deployment
  // proxy does not provide its configured trusted header, fail closed.
  return address || "proxy-ip-unavailable";
}

export async function consumeRegistrationAttempt(request) {
  await connectToDatabase();

  const secret =
    process.env.BETTER_AUTH_SECRET ||
    "local-development-only-better-auth-secret-32";

  const key = createHmac("sha256", secret)
    .update(getRequestAddress(request))
    .digest("hex");

  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const collection = mongoose.connection.db.collection("auth_registration_limits");
  globalThis.__labsRegistrationRateLimitIndexPromise ||= collection.createIndex(
    { updatedAt: 1 },
    { expireAfterSeconds: 24 * 60 * 60, name: "auth_registration_limits_ttl" },
  );
  await globalThis.__labsRegistrationRateLimitIndexPromise;

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

  return {
    allowed: Number(document?.count || 0) <= MAX_REGISTRATIONS_PER_WINDOW,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil(
        (new Date(document?.windowStartedAt || now).getTime() + WINDOW_MS - now.getTime()) /
          1000,
      ),
    ),
  };
}
