import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isSameOriginPortfolioRequest,
  MAX_PORTFOLIO_ANALYTICS_BODY_BYTES,
  readPortfolioAnalyticsJson,
} from "../src/app/lib/portfolio-analytics/request-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

function request(body, headers = {}) {
  return new Request("https://portfolio.example.com/api/v1/portfolio/visits", {
    method: "POST",
    headers: {
      origin: "https://portfolio.example.com",
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

test("same-origin validation requires an exact matching origin", () => {
  assert.equal(isSameOriginPortfolioRequest(request("{}")), true);
  assert.equal(
    isSameOriginPortfolioRequest(
      request("{}", { origin: "https://attacker.example" }),
    ),
    false,
  );
  assert.equal(
    isSameOriginPortfolioRequest(
      new Request("https://portfolio.example.com/api/v1/portfolio/visits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    ),
    false,
  );
  assert.equal(
    isSameOriginPortfolioRequest(
      request("{}", { origin: "null" }),
    ),
    false,
  );
});

test("JSON request parser accepts a small valid object", async () => {
  assert.deepEqual(
    await readPortfolioAnalyticsJson(request(JSON.stringify({ action: "start" }))),
    { action: "start" },
  );
});

test("JSON request parser rejects unsupported content types and invalid JSON", async () => {
  await assert.rejects(
    readPortfolioAnalyticsJson(request("{}", { "content-type": "text/plain" })),
    { code: "UNSUPPORTED_CONTENT_TYPE", status: 415 },
  );
  await assert.rejects(
    readPortfolioAnalyticsJson(request("{")),
    { code: "INVALID_JSON", status: 400 },
  );
  await assert.rejects(
    readPortfolioAnalyticsJson(request("[]")),
    { code: "INVALID_JSON", status: 400 },
  );
});

test("JSON request parser enforces the 1 KB cap using declared and actual bytes", async () => {
  assert.equal(MAX_PORTFOLIO_ANALYTICS_BODY_BYTES, 1024);

  await assert.rejects(
    readPortfolioAnalyticsJson(
      request("{}", { "content-length": "2048" }),
    ),
    { code: "PAYLOAD_TOO_LARGE", status: 413 },
  );

  const oversized = JSON.stringify({ note: "x".repeat(1200) });
  await assert.rejects(
    readPortfolioAnalyticsJson(request(oversized)),
    { code: "PAYLOAD_TOO_LARGE", status: 413 },
  );
});

test("ingestion API is feature gated, same-origin, bounded and rate limited", async () => {
  const route = await read("../src/app/api/v1/portfolio/visits/route.js");
  assert.ok(route.includes('config.enabled'));
  assert.ok(route.includes("isPortfolioAnalyticsHostAllowed"));
  assert.ok(route.includes("isSameOriginPortfolioRequest"));
  assert.ok(route.includes("readPortfolioAnalyticsJson"));
  assert.ok(route.includes("consumePortfolioVisitRateLimit"));
  assert.ok(route.includes("startPortfolioVisit"));
  assert.ok(route.includes("heartbeatPortfolioVisit"));
  assert.ok(route.includes("pausePortfolioVisit"));
  assert.ok(route.includes("resumePortfolioVisit"));
  assert.ok(route.includes("endPortfolioVisit"));
  assert.ok(route.includes('"Cache-Control": "private, no-store'));
  assert.ok(route.includes("429,"));
  assert.ok(route.includes("validationPaths"));
  assert.ok(route.includes('error?.name'));
  assert.ok(route.includes("error?.cause?.name"));

});

test("rate limit storage uses scoped HMAC keys and a short TTL, never raw IP", async () => {
  const [rateLimit, indexes] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/rate-limit.js"),
    read("../scripts/ensure-portfolio-analytics-indexes.mjs"),
  ]);
  assert.ok(rateLimit.includes("createHmac"));
  assert.ok(rateLimit.includes("x-vercel-forwarded-for"));
  assert.ok(rateLimit.includes("portfolio_analytics_rate_limits"));
  assert.ok(rateLimit.includes("IP_LIMITS[action]"));
  assert.ok(rateLimit.includes("ipMaximum"));
  assert.ok(rateLimit.includes("RECORD_TTL_MS"));
  assert.ok(!/\b(?:ipAddress|rawIp|clientIp)\s*:/.test(rateLimit));
  assert.ok(indexes.includes("portfolio_analytics_rate_limits_ttl"));
});

test("Portfolio Analytics page is server protected and is not indexed", async () => {
  const [page, navigation] = await Promise.all([
    read("../src/app/admin/portfolio/analytics/page.js"),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
  ]);
  assert.ok(page.includes("getCurrentAuthSession"));
  assert.ok(page.includes("isLabsOwner"));
  assert.ok(page.includes("notFound()"));
  assert.ok(page.includes("index: false"));
  assert.ok(page.includes('active="portfolio-analytics"'));
  assert.ok(navigation.includes('href: "/admin/portfolio/analytics"'));
  assert.ok(navigation.includes('label: "Portfolio analytics"'));
});
