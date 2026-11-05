import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";

const VERIFICATION_COLLECTION = "labs_verification_flows";
const VERIFICATION_FLOW_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function digestEmail(email) {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("Authentication secret is unavailable.");
  }

  return createHmac("sha256", secret)
    .update(String(email).trim().toLowerCase())
    .digest("hex");
}

async function getVerificationCollection() {
  await connectToDatabase();
  return mongoose.connection.db.collection(VERIFICATION_COLLECTION);
}

async function ensureVerificationIndexes(collection) {
  globalThis.__labsVerificationFlowIndexPromise ||= Promise.all([
    collection.createIndex(
      { flowId: 1 },
      { unique: true, name: "labs_verification_flow_unique" },
    ),
    collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "labs_verification_flow_ttl" },
    ),
  ]);

  await globalThis.__labsVerificationFlowIndexPromise;
}

export async function createVerificationFlow(email) {
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Email is required.");
  }

  const collection = await getVerificationCollection();
  await ensureVerificationIndexes(collection);

  const now = new Date();
  const flowId = randomUUID();

  await collection.insertOne({
    flowId,
    emailDigest: digestEmail(email),
    createdAt: now,
    expiresAt: new Date(now.getTime() + VERIFICATION_FLOW_TTL_MS),
    verifiedAt: null,
  });

  return flowId;
}

export async function markVerificationFlowVerified({ email }) {
  if (typeof email !== "string" || !email.trim()) return;

  const collection = await getVerificationCollection();

  await collection.updateMany(
    {
      emailDigest: digestEmail(email),
      verifiedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { verifiedAt: new Date() } },
  );
}

export async function getVerificationFlowStatus(flowId) {
  if (
    typeof flowId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(flowId)
  ) {
    return false;
  }

  const collection = await getVerificationCollection();
  const record = await collection.findOne(
    {
      flowId,
      verifiedAt: { $type: "date" },
      expiresAt: { $gt: new Date() },
    },
    { projection: { _id: 1 } },
  );

  return Boolean(record);
}

export async function discardPendingVerificationFlow(flowId) {
  if (typeof flowId !== "string") return;

  const collection = await getVerificationCollection();
  await collection.deleteOne({
    flowId,
    verifiedAt: null,
  });
}
