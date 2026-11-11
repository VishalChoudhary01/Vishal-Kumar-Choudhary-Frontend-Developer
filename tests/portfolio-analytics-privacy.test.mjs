import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  PORTFOLIO_ANALYTICS_OPT_OUT_KEY,
  PORTFOLIO_ANALYTICS_PREFERENCE_EVENT,
  readPortfolioAnalyticsOptOut,
  writePortfolioAnalyticsOptOut,
} from "../src/app/lib/portfolio-analytics/privacy-preference.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("analytics opt-out preference persists only a boolean-like browser flag", () => {
  const storage = memoryStorage();

  assert.equal(readPortfolioAnalyticsOptOut(storage), false);
  assert.equal(writePortfolioAnalyticsOptOut(true, storage), true);
  assert.equal(storage.getItem(PORTFOLIO_ANALYTICS_OPT_OUT_KEY), "1");
  assert.equal(readPortfolioAnalyticsOptOut(storage), true);
  assert.equal(writePortfolioAnalyticsOptOut(false, storage), true);
  assert.equal(storage.getItem(PORTFOLIO_ANALYTICS_OPT_OUT_KEY), null);
  assert.equal(readPortfolioAnalyticsOptOut(storage), false);
});

test("unreadable browser storage fails closed for optional analytics", () => {
  const blockedStorage = {
    getItem() {
      throw new Error("Storage is blocked");
    },
  };
  assert.equal(readPortfolioAnalyticsOptOut(blockedStorage), true);

  const blockedStorageGetter = Object.defineProperty({}, "getItem", {
    get() {
      throw new Error("Storage is blocked");
    },
  });
  assert.equal(readPortfolioAnalyticsOptOut(blockedStorageGetter), true);
});

test("privacy preference uses a named same-origin event and does not generate an identifier", async () => {
  const [preference, wrapper, tracker, control] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/privacy-preference.mjs"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDeferred.js"),
    read("../src/app/lib/portfolio-analytics/portfolio-visit-tracker.mjs"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsPrivacyPreference.js"),
  ]);

  assert.ok(preference.includes("vkr:portfolio-analytics:opt-out:v1"));
  assert.ok(preference.includes("portfolio-analytics:preference-change"));
  assert.ok(wrapper.includes("readPortfolioAnalyticsOptOut()"));
  assert.ok(wrapper.includes("stopPortfolioVisitTracking"));
  assert.ok(tracker.includes("readPortfolioAnalyticsOptOut()"));
  assert.ok(tracker.includes("export function stopPortfolioVisitTracking()"));
  assert.ok(control.includes("Turn off optional website information in this browser"));
  assert.ok(!preference.includes("randomUUID"));
});

test("privacy page explains site information in plain language without internal dashboard terminology", async () => {
  const [page, policy, preference, legalLayout] = await Promise.all([
    read("../src/app/privacy/page.js"),
    read("../src/app/lib/legal/policies.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsPrivacyPreference.js"),
    read("../src/app/components/legal/LegalDocumentPage.js"),
  ]);
  const normalizedPage = page.replace(/\s+/g, " ");

  assert.ok(normalizedPage.includes("<PageInformationPreference />"));
  assert.ok(normalizedPage.includes("Basic site information"));
  assert.ok(normalizedPage.includes("pages accessed"));
  assert.ok(normalizedPage.includes("approximate location"));
  assert.ok(normalizedPage.includes("full IP"));
  assert.ok(normalizedPage.toLowerCase().includes("clipboard contents are not collected"));
  assert.ok(normalizedPage.includes("65 days"));
  assert.ok(normalizedPage.includes("180 days"));
  assert.ok(normalizedPage.includes("does not currently have a fixed automatic expiry period"));
  assert.ok(normalizedPage.includes("does not delete information already stored"));
  assert.ok(normalizedPage.includes("or affect sign-in"));
  assert.ok(!/we track users|I track users|tracking users|user behaviour|user behavior/i.test(page));
  assert.ok(!/portfolio analytics|labs analytics|portfolio page analytics|tracking users|track user behaviour|track user behavior/i.test(page));
  assert.ok(preference.includes("Turn off optional website information in this browser"));
  assert.ok(!preference.includes("Optional site usage statistics"));
  assert.ok(!preference.includes("Disable analytics on this browser profile"));
  assert.ok(policy.includes('PRIVACY_VERSION = "2026-11-11.3"'));
  assert.ok(legalLayout.includes('effectiveDate = "4 November 2026"'));
});
test("owner dashboard provides selected, date-range and all-record deletion actions", async () => {
  const [dashboard, controls, route] = await Promise.all([
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDeletionControls.js"),
    read("../src/app/api/v1/admin/portfolio/analytics/visits/route.js"),
  ]);

  assert.ok(dashboard.includes("selectedVisitIds"));
  assert.ok(dashboard.includes("onToggleVisit"));
  assert.ok(dashboard.includes("PortfolioAnalyticsDeletionControls"));
  assert.ok(controls.includes("Delete selected"));
  assert.ok(controls.includes("Delete date range"));
  assert.ok(controls.includes("Delete all data"));
  assert.ok(controls.includes('method: "DELETE"'));
  assert.ok(controls.includes("confirmation !== expectedConfirmation"));
  assert.ok(route.includes("deletePortfolioVisitRecords"));
});
