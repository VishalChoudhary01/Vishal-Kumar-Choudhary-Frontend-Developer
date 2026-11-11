import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { buildPortfolioVerifiedVisitor } from "./verified-visitor.mjs";
import PortfolioVisit from "./models/PortfolioVisit";
import {
  getPortfolioAnalyticsConfig,
  isPortfolioAnalyticsHostAllowed,
} from "./config.mjs";
import {
  calculatePortfolioHeartbeatDelta,
  getPortfolioVisitExpiry,
  parsePortfolioVisitLifecyclePayload,
  parsePortfolioVisitStartPayload,
  readPortfolioLocation,
  classifyPortfolioDevice,
  resolvePortfolioAttribution,
} from "./visit-utils.mjs";

const MINIMUM_HEARTBEAT_INTERVAL_MS = 10_000;
const MAXIMUM_HEARTBEAT_DELTA_MS = 20_000;

function serviceError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getEnabledConfig(request) {
  const config = getPortfolioAnalyticsConfig();
  if (!config.enabled) {
    throw serviceError("PORTFOLIO_ANALYTICS_DISABLED", "Portfolio Analytics is disabled.");
  }

  let host = null;
  try {
    // Use the runtime request URL, not a forwarded-host header.
    host = new URL(request?.url || "").hostname;
  } catch {
    host = null;
  }

  if (!isPortfolioAnalyticsHostAllowed({ host })) {
    throw serviceError("PORTFOLIO_ANALYTICS_HOST_NOT_ALLOWED", "Tracking is not enabled for this host.");
  }

  return config;
}

function createHash(secret, context, value) {
  return createHmac("sha256", secret)
    .update(context)
    .update("\0")
    .update(value)
    .digest("hex");
}

function getRequestOwnHosts(request) {
  const hosts = [];
  try {
    hosts.push(new URL(request?.url || "").hostname);
  } catch {
    // Missing runtime URL leaves only the configured canonical host.
  }

  try {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (configuredUrl) hosts.push(new URL(configuredUrl).hostname);
  } catch {
    // A malformed canonical URL is already rejected by host configuration.
  }

  return hosts.filter(Boolean);
}

function getSessionScopedFilter(parsed, secret) {
  return {
    visitId: parsed.visitId,
    sessionHash: createHash(
      secret,
      "portfolio-analytics:session:v1",
      parsed.tabSessionId,
    ),
  };
}

async function resolveVerifiedVisitor(request, secret) {
  try {
    const session = await getCurrentAuthSession(request?.headers);
    return buildPortfolioVerifiedVisitor({
      user: session?.user,
      secret,
    });
  } catch {
    // Anonymous visit tracking must continue when authentication is unavailable.
    return null;
  }
}

async function attachVerifiedVisitorToVisit(filter, request, secret, status = "active") {
  const visitorFilter = {
    ...filter,
    status,
    $or: [
      { verifiedUserHash: null },
      { verifiedUserHash: { $exists: false } },
    ],
  };

  // Avoid repeated auth/database work once this visit already has an identity.
  const visitNeedsIdentity = await PortfolioVisit.exists(visitorFilter);
  if (!visitNeedsIdentity) return;

  const verifiedVisitor = await resolveVerifiedVisitor(request, secret);
  if (!verifiedVisitor) return;

  await PortfolioVisit.updateOne(visitorFilter, { $set: verifiedVisitor });
}

function buildVisitRecord({ parsed, request, secret, now, verifiedVisitor }) {
  const headers = request.headers;
  const sessionHash = createHash(
    secret,
    "portfolio-analytics:session:v1",
    parsed.tabSessionId,
  );
  const startKeyHash = createHash(
    secret,
    "portfolio-analytics:start:v1",
    sessionHash + ":" + parsed.idempotencyKey,
  );

  const location = readPortfolioLocation(headers);
  const deviceType = classifyPortfolioDevice(headers.get("user-agent"));
  const attribution = resolvePortfolioAttribution({
    referrer: parsed.referrerHost
      ? `https://${parsed.referrerHost}`
      : headers.get("referer"),
    ownHosts: getRequestOwnHosts(request),
    utmSource: parsed.utmSource,
    utmMedium: parsed.utmMedium,
    utmCampaign: parsed.utmCampaign,
    isInternalNavigation: parsed.isInternalNavigation,
  });

  return {
    visitId: randomUUID(),
    startKeyHash,
    sessionHash,
    pageType: parsed.pageType,
    path: parsed.path,
    slug: parsed.slug,
    sourceType: attribution.sourceType,
    referrerHost: attribution.referrerHost,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    countryCode: location.countryCode,
    regionCode: location.regionCode,
    city: location.city,
    deviceType,
    ...(verifiedVisitor || {}),
    startedAt: now,
    lastHeartbeatAt: now,
    activeSeconds: 0,
    status: "active",
    endedAt: null,
    expiresAt: getPortfolioVisitExpiry(now),
    schemaVersion: 1,
  };
}

function publicVisitResult(document) {
  if (!document) return null;
  return {
    visitId: document.visitId,
    status: document.status,
    startedAt: document.startedAt,
    activeSeconds: document.activeSeconds,
  };
}

/**
 * Start is idempotent for a given temporary tab-session + route-visit key.
 * Only HMACs of browser identifiers are persisted; raw browser values stay
 * in memory. Verified account identity is captured separately from the
 * server-validated auth session for the private owner report.
 */
export async function startPortfolioVisit(payload, request, now = new Date()) {
  const config = getEnabledConfig(request);
  const parsed = parsePortfolioVisitStartPayload(payload);
  const timestamp = new Date(now);
  if (Number.isNaN(timestamp.getTime())) {
    throw serviceError("INVALID_SERVER_TIME", "A valid server timestamp is required.");
  }

  // Identity comes only from the Better Auth session on this exact request.
  const verifiedVisitor = await resolveVerifiedVisitor(request, config.hmacSecret);

  const record = buildVisitRecord({
    parsed,
    request,
    secret: config.hmacSecret,
    now: timestamp,
    verifiedVisitor,
  });

  await connectToDatabase();

  try {
    const document = await PortfolioVisit.findOneAndUpdate(
      { startKeyHash: record.startKeyHash },
      { $setOnInsert: record },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
      .select("visitId status startedAt activeSeconds")
      .lean();

    // Also enrich a prior guest insert when this idempotent start is retried
    // after the user has signed in.
    await attachVerifiedVisitorToVisit(
      { startKeyHash: record.startKeyHash },
      request,
      config.hmacSecret,
      "active",
    );

    return publicVisitResult(document);
  } catch (error) {
    if (error?.code !== 11000) throw error;

    // Concurrent Strict Mode/retry requests can race on the unique idempotency
    // index. Resolve the winning insert rather than creating a second visit.
    const existing = await PortfolioVisit.findOne({
      startKeyHash: record.startKeyHash,
    })
      .select("visitId status startedAt activeSeconds")
      .lean();

    if (!existing) throw error;
    await attachVerifiedVisitorToVisit(
      { startKeyHash: record.startKeyHash },
      request,
      config.hmacSecret,
      "active",
    );
    return publicVisitResult(existing);
  }
}

function elapsedSecondsExpression(now) {
  const elapsedMs = {
    $max: [
      0,
      {
        $subtract: [
          now,
          { $ifNull: ["$lastHeartbeatAt", now] },
        ],
      },
    ],
  };
  const cappedMs = { $min: [elapsedMs, MAXIMUM_HEARTBEAT_DELTA_MS] };

  return {
    $cond: [
      { $gte: [elapsedMs, MINIMUM_HEARTBEAT_INTERVAL_MS] },
      { $floor: { $divide: [cappedMs, 1000] } },
      0,
    ],
  };
}

/**
 * Atomic heartbeat update. The server clock determines the duration and one
 * database operation prevents two concurrent heartbeat requests double-counting
 * the same interval. A too-frequent request is ignored.
 */
export async function heartbeatPortfolioVisit(payload, request, now = new Date()) {
  const config = getEnabledConfig(request);
  const parsed = parsePortfolioVisitLifecyclePayload(payload);
  if (parsed.action !== "heartbeat") {
    throw serviceError("INVALID_LIFECYCLE_ACTION", "Heartbeat action is required.");
  }

  const timestamp = new Date(now);
  if (Number.isNaN(timestamp.getTime())) {
    throw serviceError("INVALID_SERVER_TIME", "A valid server timestamp is required.");
  }

  await connectToDatabase();
  await attachVerifiedVisitorToVisit(
    getSessionScopedFilter(parsed, config.hmacSecret),
    request,
    config.hmacSecret,
    "active",
  );

  const document = await PortfolioVisit.findOneAndUpdate(
    {
      ...getSessionScopedFilter(parsed, config.hmacSecret),
      status: "active",
      lastHeartbeatAt: {
        $lte: new Date(timestamp.getTime() - MINIMUM_HEARTBEAT_INTERVAL_MS),
      },
    },
    [
      {
        $set: {
          activeSeconds: {
            $add: [
              { $ifNull: ["$activeSeconds", 0] },
              elapsedSecondsExpression(timestamp),
            ],
          },
          lastHeartbeatAt: timestamp,
        },
      },
    ],
    { returnDocument: "after" },
  )
    .select("visitId status activeSeconds lastHeartbeatAt")
    .lean();

  return publicVisitResult(document);
}

export async function pausePortfolioVisit(payload, request, now = new Date()) {
  const config = getEnabledConfig(request);
  const parsed = parsePortfolioVisitLifecyclePayload(payload);
  if (parsed.action !== "pause") {
    throw serviceError("INVALID_LIFECYCLE_ACTION", "Pause action is required.");
  }

  const timestamp = new Date(now);
  if (Number.isNaN(timestamp.getTime())) {
    throw serviceError("INVALID_SERVER_TIME", "A valid server timestamp is required.");
  }

  await connectToDatabase();
  const document = await PortfolioVisit.findOneAndUpdate(
    { ...getSessionScopedFilter(parsed, config.hmacSecret), status: "active" },
    [
      {
        $set: {
          activeSeconds: {
            $add: [
              { $ifNull: ["$activeSeconds", 0] },
              elapsedSecondsExpression(timestamp),
            ],
          },
          lastHeartbeatAt: timestamp,
          status: "paused",
          endedAt: timestamp,
        },
      },
    ],
    { returnDocument: "after" },
  )
    .select("visitId status activeSeconds lastHeartbeatAt endedAt")
    .lean();

  return publicVisitResult(document);
}

export async function resumePortfolioVisit(payload, request, now = new Date()) {
  const config = getEnabledConfig(request);
  const parsed = parsePortfolioVisitLifecyclePayload(payload);
  if (parsed.action !== "resume") {
    throw serviceError("INVALID_LIFECYCLE_ACTION", "Resume action is required.");
  }

  const timestamp = new Date(now);
  if (Number.isNaN(timestamp.getTime())) {
    throw serviceError("INVALID_SERVER_TIME", "A valid server timestamp is required.");
  }

  await connectToDatabase();
  const document = await PortfolioVisit.findOneAndUpdate(
    {
      ...getSessionScopedFilter(parsed, config.hmacSecret),
      status: { $in: ["active", "paused"] },
    },
    {
      $set: {
        status: "active",
        lastHeartbeatAt: timestamp,
        endedAt: null,
      },
    },
    { returnDocument: "after", runValidators: true },
  )
    .select("visitId status activeSeconds lastHeartbeatAt")
    .lean();

  return publicVisitResult(document);
}

export async function endPortfolioVisit(payload, request, now = new Date()) {
  const config = getEnabledConfig(request);
  const parsed = parsePortfolioVisitLifecyclePayload(payload);
  if (parsed.action !== "end") {
    throw serviceError("INVALID_LIFECYCLE_ACTION", "End action is required.");
  }

  const timestamp = new Date(now);
  if (Number.isNaN(timestamp.getTime())) {
    throw serviceError("INVALID_SERVER_TIME", "A valid server timestamp is required.");
  }

  await connectToDatabase();
  const document = await PortfolioVisit.findOneAndUpdate(
    {
      ...getSessionScopedFilter(parsed, config.hmacSecret),
      status: { $in: ["active", "paused"] },
    },
    [
      {
        $set: {
          activeSeconds: {
            $add: [
              { $ifNull: ["$activeSeconds", 0] },
              {
                $cond: [
                  { $eq: ["$status", "active"] },
                  elapsedSecondsExpression(timestamp),
                  0,
                ],
              },
            ],
          },
          lastHeartbeatAt: timestamp,
          status: "ended",
          endedAt: timestamp,
        },
      },
    ],
    { returnDocument: "after" },
  )
    .select("visitId status activeSeconds lastHeartbeatAt endedAt")
    .lean();

  return publicVisitResult(document);
}
