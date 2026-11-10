import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPortfolioVisitStartPayload,
  getPortfolioReferrerHost,
} from "../src/app/lib/portfolio-analytics/tracker-payload.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const tabSessionId = "a8b6a7ac-6c23-4ca1-a1d4-cb5cf1123456";
const idempotencyKey = "b8b6a7ac-6c23-4ca1-a1d4-cb5cf1123456";

test("tracker payload accepts only the four approved public route types", () => {
  const routes = ["/", "/projects/spendwise", "/labs", "/labs/fluid-gradient-playground"];

  for (const pathname of routes) {
    const payload = buildPortfolioVisitStartPayload({
      pathname,
      tabSessionId,
      idempotencyKey,
    });
    assert.ok(payload);
    assert.equal(payload.action, "start");
    assert.equal(payload.path, pathname);
  }
});

test("tracker rejects admin, authentication, privacy, API and unsupported routes", () => {
  for (const pathname of [
    "/admin/portfolio/analytics",
    "/admin/labs/analytics",
    "/labs/login",
    "/labs/signup",
    "/privacy",
    "/api/v1/portfolio/visits",
    "/projects/spendwise?token=secret",
  ]) {
    assert.equal(
      buildPortfolioVisitStartPayload({
        pathname,
        tabSessionId,
        idempotencyKey,
      }),
      null,
    );
  }
});

test("UTM attribution is allowlisted and arbitrary query parameters are omitted", () => {
  const payload = buildPortfolioVisitStartPayload({
    pathname: "/",
    tabSessionId,
    idempotencyKey,
    search: "?utm_source=GitHub&utm_medium=social&utm_campaign=portfolio&email=private@example.com&token=secret",
  });

  assert.deepEqual(payload, {
    action: "start",
    path: "/",
    tabSessionId,
    idempotencyKey,
    utmSource: "GitHub",
    utmMedium: "social",
    utmCampaign: "portfolio",
  });
  assert.equal("email" in payload, false);
  assert.equal("token" in payload, false);
});

test("referrer handling retains only a safe external hostname", () => {
  assert.equal(
    getPortfolioReferrerHost(
      "https://source.example.com/article/private?email=secret",
      "portfolio.example.com",
    ),
    "source.example.com",
  );
  assert.equal(
    getPortfolioReferrerHost(
      "https://portfolio.example.com/projects/spendwise",
      "portfolio.example.com",
    ),
    null,
  );
  assert.equal(
    getPortfolioReferrerHost("javascript:alert(1)", "portfolio.example.com"),
    null,
  );
  assert.equal(
    getPortfolioReferrerHost("https://user:pass@source.example.com/path", "portfolio.example.com"),
    null,
  );
});

test("subsequent same-tab routes are marked internal and do not inherit campaign fields", () => {
  const payload = buildPortfolioVisitStartPayload({
    pathname: "/projects/spendwise",
    tabSessionId,
    idempotencyKey,
    search: "?utm_source=github",
    referrerHost: "github.com",
    isInternalNavigation: true,
  });

  assert.deepEqual(payload, {
    action: "start",
    path: "/projects/spendwise",
    tabSessionId,
    idempotencyKey,
    isInternalNavigation: true,
  });
});

test("tracker is deferred and mounted only in the three public route shells", async () => {
  const [deferred, home, project, labs, layout, providers, runtime] = await Promise.all([
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDeferred.js"),
    read("../src/app/components/HomePage.js"),
    read("../src/app/projects/[slug]/ProjectPageView.js"),
    read("../src/app/components/labs/LabsPageShell.js"),
    read("../src/app/layout.js"),
    read("../src/app/providers/AppProviders.js"),
    read("../src/app/lib/portfolio-analytics/portfolio-visit-tracker.mjs"),
  ]);

  assert.ok(deferred.includes("requestIdleCallback"));
  assert.ok(deferred.includes("FALLBACK_DELAY_MS"));
  assert.ok(deferred.includes("trackerModulePromise"));
  assert.ok(home.includes("<PortfolioAnalyticsDeferred />"));
  assert.ok(project.includes("<PortfolioAnalyticsDeferred />"));
  assert.ok(labs.includes("<PortfolioAnalyticsDeferred />"));
  assert.ok(!layout.includes("PortfolioAnalyticsDeferred"));
  assert.ok(!providers.includes("PortfolioAnalyticsDeferred"));
  assert.ok(runtime.includes("HEARTBEAT_INTERVAL_MS = 15_000"));
  assert.ok(runtime.includes("visibilitychange"));
  assert.ok(runtime.includes("sendBeacon"));
  assert.ok(runtime.includes("LANDING_ATTRIBUTION_KEY"));
  assert.ok(runtime.includes("RELEASE_GRACE_MS"));
  assert.ok(runtime.includes("visit.ended"));
  assert.ok(runtime.includes("readPortfolioAnalyticsOptOut"));
  assert.ok(runtime.includes("stopPortfolioVisitTracking"));
});

test("client feature gate is separate from the server secret", async () => {
  const [wrapper, config] = await Promise.all([
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDeferred.js"),
    read("../src/app/lib/portfolio-analytics/config.mjs"),
  ]);
  assert.ok(wrapper.includes("NEXT_PUBLIC_PORTFOLIO_ANALYTICS_ENABLED"));
  assert.ok(config.includes("PORTFOLIO_ANALYTICS_ENABLED"));
  assert.ok(!wrapper.includes("PORTFOLIO_ANALYTICS_HMAC_SECRET"));
});
