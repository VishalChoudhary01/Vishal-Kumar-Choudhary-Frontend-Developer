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
  assert.ok(control.includes("Disable analytics on this browser profile"));
  assert.ok(!preference.includes("randomUUID"));
});

test("privacy page uses plain-language disclosures for optional page statistics and Labs activity", async () => {
  const [page, policy, preference, legalLayout] = await Promise.all([
    read("../src/app/privacy/page.js"),
    read("../src/app/lib/legal/policies.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsPrivacyPreference.js"),
    read("../src/app/components/legal/LegalDocumentPage.js"),
  ]);

  assert.ok(page.includes("PortfolioAnalyticsPrivacyPreference"));
  assert.ok(page.includes("Optional site usage statistics"));
  assert.ok(page.includes("approximate country, region and city"));
  assert.ok(page.includes("full IP"));
  assert.ok(page.includes("clipboard contents are not collected"));
  assert.ok(page.includes("65 days"));
  assert.ok(page.includes("180 days"));
  assert.ok(page.includes("do not currently have a fixed automatic expiry period"));
  assert.ok(page.includes("does not delete records already stored"));
  assert.ok(page.includes("does not turn off the separate records"));
  assert.ok(!/we track users|I track users|tracking users/i.test(page));
  assert.ok(preference.includes("Turn off optional site statistics in this browser"));
  assert.ok(policy.includes('PRIVACY_VERSION = "2026-11-11.1"'));
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
