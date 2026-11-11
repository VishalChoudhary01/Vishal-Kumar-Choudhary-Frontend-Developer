import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getPortfolioAnalyticsConfig,
  isPortfolioAnalyticsHostAllowed,
  PORTFOLIO_ANALYTICS_RETENTION_DAYS,
} from "../src/app/lib/portfolio-analytics/config.mjs";
import {
  calculatePortfolioHeartbeatDelta,
  classifyPortfolioDevice,
  getPortfolioVisitExpiry,
  parsePortfolioVisitLifecyclePayload,
  parsePortfolioVisitStartPayload,
  readPortfolioLocation,
  resolvePortfolioAttribution,
  resolvePortfolioVisitPage,
} from "../src/app/lib/portfolio-analytics/visit-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const sessionId = "a8b6a7ac-6c23-4ca1-a1d4-cb5cf1123456";
const idempotencyKey = "b8b6a7ac-6c23-4ca1-a1d4-cb5cf1123456";
const visitId = "c8b6a7ac-6c23-4ca1-a1d4-cb5cf1123456";

test("public route allowlist accepts only home, project, Labs collection and Lab detail", () => {
  assert.deepEqual(resolvePortfolioVisitPage("/"), {
    pageType: "home",
    path: "/",
    slug: null,
  });
  assert.deepEqual(resolvePortfolioVisitPage("/projects/spendwise"), {
    pageType: "project",
    path: "/projects/spendwise",
    slug: "spendwise",
  });
  assert.deepEqual(resolvePortfolioVisitPage("/labs"), {
    pageType: "labs_index",
    path: "/labs",
    slug: null,
  });
  assert.deepEqual(resolvePortfolioVisitPage("/labs/magnetic-interaction"), {
    pageType: "lab_detail",
    path: "/labs/magnetic-interaction",
    slug: "magnetic-interaction",
  });
});

test("unsupported, private and malformed routes cannot be tracked", () => {
  for (const path of [
    "/admin",
    "/admin/labs/analytics",
    "/labs/login",
    "/labs/signup",
    "/labs/forgot-password",
    "/labs/a?token=secret",
    "/labs/%2e%2e",
    "/projects/../admin",
    "//external.example",
    "/unknown",
  ]) {
    assert.equal(resolvePortfolioVisitPage(path), null, path);
  }
});

test("start payload is strict and returns only normalized allowlisted fields", () => {
  const parsed = parsePortfolioVisitStartPayload({
    action: "start",
    path: "/projects/spendwise/",
    tabSessionId: sessionId,
    idempotencyKey,
    utmSource: " LinkedIn ",
    utmMedium: " Social ",
    utmCampaign: "Frontend Role",
  });

  assert.deepEqual(parsed, {
    action: "start",
    pageType: "project",
    path: "/projects/spendwise",
    slug: "spendwise",
    tabSessionId: sessionId,
    idempotencyKey,
    utmSource: "linkedin",
    utmMedium: "social",
    utmCampaign: "frontend role",
  });
  assert.throws(
    () => parsePortfolioVisitStartPayload({
      action: "start",
      path: "/",
      tabSessionId: sessionId,
      idempotencyKey,
      ip: "203.0.113.1",
    }),
    /Unexpected request field/,
  );
  assert.deepEqual(
    parsePortfolioVisitStartPayload({
      action: "start",
      path: "/",
      tabSessionId: sessionId,
      idempotencyKey,
      isInternalNavigation: true,
      referrerHost: "external.example",
      utmSource: "github",
    }),
    {
      action: "start",
      pageType: "home",
      path: "/",
      slug: null,
      tabSessionId: sessionId,
      idempotencyKey,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      isInternalNavigation: true,
    },
  );
  assert.throws(
    () => parsePortfolioVisitStartPayload({
      action: "start",
      path: "/",
      tabSessionId: sessionId,
      idempotencyKey,
      referrerHost: "https://attacker.example/private?token=x",
    }),
    /Referrer host is invalid/,
  );
  assert.throws(
    () => parsePortfolioVisitStartPayload({
      action: "start",
      path: "/admin",
      tabSessionId: sessionId,
      idempotencyKey,
    }),
    /not eligible/,
  );
});

test("lifecycle payload accepts only a server-issued visit reference and known action", () => {
  assert.deepEqual(
    parsePortfolioVisitLifecyclePayload({ action: "heartbeat", visitId, tabSessionId: sessionId }),
    { action: "heartbeat", visitId, tabSessionId: sessionId },
  );
  for (const payload of [
    { action: "heartbeat", visitId, tabSessionId: sessionId, activeSeconds: 500 },
    { action: "resume", visitId, tabSessionId: sessionId, country: "IN" },
    { action: "pause", visitId },
    { action: "delete", visitId },
    { action: "end", visitId: "not-a-uuid" },
  ]) {
    assert.throws(() => parsePortfolioVisitLifecyclePayload(payload));
  }
});

test("location parser stores only coarse Vercel country, region and city", () => {
  const headers = new Map([
    ["x-vercel-ip-country", "in"],
    ["x-vercel-ip-country-region", "BR"],
    ["x-vercel-ip-city", "Patna%20City"],
    ["x-forwarded-for", "203.0.113.5"],
    ["x-vercel-ip-latitude", "25.6"],
  ]);
  const location = readPortfolioLocation({ get: (key) => headers.get(key) || null });

  assert.deepEqual(location, {
    countryCode: "IN",
    regionCode: "BR",
    city: "Patna City",
  });
  assert.equal("ip" in location, false);
  assert.equal("latitude" in location, false);
});

test("malformed location metadata degrades safely to unknown", () => {
  const headers = new Map([
    ["x-vercel-ip-country", "India"],
    ["x-vercel-ip-country-region", "Bihar-State"],
    ["x-vercel-ip-city", "%E0%A4"],
  ]);
  assert.deepEqual(
    readPortfolioLocation({ get: (key) => headers.get(key) || null }),
    { countryCode: null, regionCode: null, city: null },
  );
});

test("device classification stores only a coarse category", () => {
  assert.equal(classifyPortfolioDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile"), "mobile");
  assert.equal(classifyPortfolioDevice("Mozilla/5.0 (iPad; CPU OS 17_0)"), "tablet");
  assert.equal(classifyPortfolioDevice("Mozilla/5.0 (Linux; Android 14)"), "tablet");
  assert.equal(classifyPortfolioDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "desktop");
  assert.equal(classifyPortfolioDevice(null), "unknown");
});

test("referrer attribution retains only a host and gives campaign/internal priority", () => {
  assert.deepEqual(
    resolvePortfolioAttribution({
      referrer: "https://news.example.com/article?id=private",
      ownHosts: ["portfolio.example.com"],
    }),
    {
      sourceType: "referral",
      referrerHost: "news.example.com",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    },
  );
  assert.equal(
    resolvePortfolioAttribution({
      referrer: "https://portfolio.example.com/projects/spendwise",
      ownHosts: ["portfolio.example.com"],
    }).sourceType,
    "internal",
  );
  assert.equal(
    resolvePortfolioAttribution({ utmSource: "github" }).sourceType,
    "campaign",
  );
});

test("visible-time heartbeat rejects fast/reversed intervals and caps long gaps", () => {
  const start = new Date("2026-11-07T10:00:00.000Z");
  assert.deepEqual(
    calculatePortfolioHeartbeatDelta({
      lastHeartbeatAt: start,
      now: new Date(start.getTime() + 5_000),
    }),
    { accepted: false, deltaSeconds: 0 },
  );
  assert.deepEqual(
    calculatePortfolioHeartbeatDelta({
      lastHeartbeatAt: start,
      now: new Date(start.getTime() - 1_000),
    }),
    { accepted: false, deltaSeconds: 0 },
  );
  assert.deepEqual(
    calculatePortfolioHeartbeatDelta({
      lastHeartbeatAt: start,
      now: new Date(start.getTime() + 15_000),
    }),
    { accepted: true, deltaSeconds: 15 },
  );
  assert.deepEqual(
    calculatePortfolioHeartbeatDelta({
      lastHeartbeatAt: start,
      now: new Date(start.getTime() + 60_000),
    }),
    { accepted: true, deltaSeconds: 20 },
  );
});

test("visit expiry is fixed at 65 days from start and never from heartbeat", () => {
  const start = new Date("2026-11-07T10:00:00.000Z");
  const expiry = getPortfolioVisitExpiry(start);
  assert.equal(
    expiry.getTime() - start.getTime(),
    65 * 24 * 60 * 60 * 1000,
  );
  assert.equal(PORTFOLIO_ANALYTICS_RETENTION_DAYS, 65);
});

test("analytics remains disabled by default and requires a strong HMAC secret when enabled", () => {
  assert.deepEqual(getPortfolioAnalyticsConfig({}), {
    enabled: false,
    hmacSecret: null,
  });
  assert.throws(
    () => getPortfolioAnalyticsConfig({
      PORTFOLIO_ANALYTICS_ENABLED: "true",
      PORTFOLIO_ANALYTICS_HMAC_SECRET: "short",
    }),
    { code: "PORTFOLIO_ANALYTICS_NOT_CONFIGURED" },
  );
  assert.equal(
    getPortfolioAnalyticsConfig({
      PORTFOLIO_ANALYTICS_ENABLED: "true",
      PORTFOLIO_ANALYTICS_HMAC_SECRET: "a".repeat(48),
    }).enabled,
    true,
  );
});

test("production host gate rejects previews and accepts only the canonical host", () => {
  const env = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com",
  };
  assert.equal(isPortfolioAnalyticsHostAllowed({ host: "portfolio.example.com", env }), true);
  assert.equal(isPortfolioAnalyticsHostAllowed({ host: "preview-123.vercel.app", env }), false);
  assert.equal(
    isPortfolioAnalyticsHostAllowed({
      host: "portfolio.example.com",
      env: { ...env, VERCEL_ENV: "preview" },
    }),
    false,
  );
});

test("model, service and index script enforce privacy, server lifecycle and TTL contracts", async () => {
  const [model, service, indexScript, database] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/models/PortfolioVisit.js"),
    read("../src/app/lib/portfolio-analytics/visit-service.js"),
    read("../scripts/ensure-portfolio-analytics-indexes.mjs"),
    read("../src/app/lib/db/mongoose.js"),
  ]);

  assert.ok(model.includes('collection: "portfolio_visits"'));
  assert.ok(model.includes("portfolio_visits_expiry_ttl"));
  assert.ok(model.includes("expireAfterSeconds: 0"));
  assert.ok(model.includes("select: false"));
  assert.ok(model.includes("verifiedUserAccountId"));
  assert.ok(model.includes("maxlength: 128"));
  assert.ok(!/\b(?:ipAddress|rawIp|userAgent|tabSessionId|idempotencyKey)\s*:/.test(model));

  assert.ok(service.includes("createHmac"));
  assert.ok(service.includes("getSessionScopedFilter"));
  assert.ok(service.includes('host = new URL(request?.url || "").hostname'));
  assert.ok(service.includes('status: { $in: ["active", "paused"] }'));
  assert.ok(service.includes("startKeyHash"));
  assert.ok(service.includes("sessionHash"));
  assert.ok(service.includes("$setOnInsert"));
  assert.ok(service.includes("elapsedSecondsExpression"));
  assert.ok(!service.includes("x-forwarded-for"));

  assert.ok(indexScript.includes("portfolio_visits_expiry_ttl"));
  assert.ok(indexScript.includes("expireAfterSeconds: 0"));

  assert.ok(database.includes("mongoose.connection.readyState !== 1"));
  assert.ok(database.includes("cached.promise = null"));
  assert.ok(database.includes("connection did not reach the connected state"));
});
