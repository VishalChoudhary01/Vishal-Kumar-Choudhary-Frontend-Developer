import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";

const CONSENT_COLLECTION = "labs_registration_consents";
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

async function getCollection(name) {
  await connectToDatabase();
  return mongoose.connection.db.collection(name);
}

export async function recordRegistrationConsent({
  email,
  termsVersion,
  privacyVersion,
}) {
  if (!email || !termsVersion || !privacyVersion) {
    throw new Error("Required registration consent data is missing.");
  }

  const receiptId = randomUUID();
  const emailDigest = digestEmail(email);
  const acceptedAt = new Date();

  const [consents, flows] = await Promise.all([
    getCollection(CONSENT_COLLECTION),
    getCollection(VERIFICATION_COLLECTION),
  ]);

  globalThis.__labsConsentIndexesPromise ||= Promise.all([
    consents.createIndex(
      { receiptId: 1 },
      { unique: true, name: "labs_consent_receipt_unique" },
    ),
    consents.createIndex(
      { emailDigest: 1, acceptedAt: -1 },
      { name: "labs_consent_email_lookup" },
    ),
    flows.createIndex(
      { flowId: 1 },
      { unique: true, name: "labs_verification_flow_unique" },
    ),
    flows.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "labs_verification_flow_ttl" },
    ),
  ]);

  await globalThis.__labsConsentIndexesPromise;

  await Promise.all([
    consents.insertOne({
      receiptId,
      emailDigest,
      userId: null,
      termsVersion,
      privacyVersion,
      acceptedAt,
      linkedAt: null,
      verifiedAt: null,
    }),
    flows.insertOne({
      flowId: receiptId,
      emailDigest,
      createdAt: acceptedAt,
      expiresAt: new Date(acceptedAt.getTime() + VERIFICATION_FLOW_TTL_MS),
      verifiedAt: null,
    }),
  ]);

  return receiptId;
}

export async function linkLatestRegistrationConsent({ email, userId }) {
  if (!email || !userId) return;

  const consents = await getCollection(CONSENT_COLLECTION);

  await consents.findOneAndUpdate(
    {
      emailDigest: digestEmail(email),
      userId: null,
    },
    {
      $set: {
        userId,
        linkedAt: new Date(),
      },
    },
    {
      sort: { acceptedAt: -1 },
      returnDocument: "after",
    },
  );
}

export async function markRegistrationConsentVerified({ email }) {
  if (!email) return;

  const emailDigest = digestEmail(email);
  const now = new Date();

  const [consents, flows] = await Promise.all([
    getCollection(CONSENT_COLLECTION),
    getCollection(VERIFICATION_COLLECTION),
  ]);

  await Promise.all([
    consents.updateMany(
      {
        emailDigest,
        userId: { $ne: null },
        verifiedAt: null,
      },
      { $set: { verifiedAt: now } },
    ),
    flows.updateMany(
      {
        emailDigest,
        verifiedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { verifiedAt: now } },
    ),
  ]);
}

export async function createVerificationFlow(email) {
  if (!email) throw new Error("Email is required.");

  const collection = await getCollection(VERIFICATION_COLLECTION);
  const now = new Date();
  const flowId = randomUUID();

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
  await collection.insertOne({
    flowId,
    emailDigest: digestEmail(email),
    createdAt: now,
    expiresAt: new Date(now.getTime() + VERIFICATION_FLOW_TTL_MS),
    verifiedAt: null,
  });

  return flowId;
}

export async function getVerificationFlowStatus(flowId) {
  if (
    typeof flowId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(flowId)
  ) {
    return false;
  }

  const collection = await getCollection(VERIFICATION_COLLECTION);
  const record = await collection.findOne({
    flowId,
    verifiedAt: { $type: "date" },
    expiresAt: { $gt: new Date() },
  }, {
    projection: { _id: 1 },
  });

  return Boolean(record);
}

export async function discardUnlinkedRegistrationConsent(receiptId) {
  if (typeof receiptId !== "string") return;

  const [consents, flows] = await Promise.all([
    getCollection(CONSENT_COLLECTION),
    getCollection(VERIFICATION_COLLECTION),
  ]);

  await Promise.all([
    consents.deleteOne({ receiptId, userId: null }),
    flows.deleteOne({ flowId: receiptId, verifiedAt: null }),
  ]);
}
