"use client";

import { useState, useSyncExternalStore } from "react";
import {
  PORTFOLIO_ANALYTICS_OPT_OUT_KEY,
  PORTFOLIO_ANALYTICS_PREFERENCE_EVENT,
  readPortfolioAnalyticsOptOut,
  writePortfolioAnalyticsOptOut,
} from "@/app/lib/portfolio-analytics/privacy-preference.mjs";

function subscribeToPreference(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, onChange);
  };
}

function getPreferenceSnapshot() {
  return readPortfolioAnalyticsOptOut();
}

function getServerPreferenceSnapshot() {
  return false;
}

export default function PortfolioAnalyticsPrivacyPreference() {
  const optedOut = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot,
  );
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  const updatePreference = (nextValue) => {
    const saved = writePortfolioAnalyticsOptOut(nextValue);
    if (!saved) {
      setStorageUnavailable(true);
      return;
    }

    setStorageUnavailable(false);
    window.dispatchEvent(new Event(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT));
  };

  return (
    <div className="border border-border bg-surface-1 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3 className="text-sm font-semibold text-text-primary">
            Optional site usage statistics
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            When enabled by the site owner, limited information about public page visits,
            broad device category, approximate location and referral source may be used
            to improve the website. This choice is saved only in this browser.
          </p>
        </div>

        <label className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-3 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={optedOut}
            onChange={(event) => updatePreference(event.target.checked)}
            className="size-4 accent-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          />
          <span className="font-medium">
            Turn off optional site statistics in this browser
          </span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className={optedOut ? "text-success" : "text-text-tertiary"}>
          {optedOut
            ? "Optional site statistics are off for this browser."
            : "Optional site statistics are allowed if the site feature is enabled."}
        </p>
        {storageUnavailable ? (
          <p role="alert" className="text-warning">
            Browser storage is unavailable. The preference could not be saved.
          </p>
        ) : null}
      </div>
    </div>
  );
}
