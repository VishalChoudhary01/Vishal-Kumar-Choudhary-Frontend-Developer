"use client";

import { useEffect, useState } from "react";
import {
  PORTFOLIO_ANALYTICS_OPT_OUT_KEY,
  PORTFOLIO_ANALYTICS_PREFERENCE_EVENT,
  readPortfolioAnalyticsOptOut,
  writePortfolioAnalyticsOptOut,
} from "@/app/lib/portfolio-analytics/privacy-preference.mjs";

export default function PortfolioAnalyticsPrivacyPreference() {
  const [optedOut, setOptedOut] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    setOptedOut(readPortfolioAnalyticsOptOut());
    setReady(true);

    const syncPreference = (event) => {
      if (event?.type === "storage" && event.key !== PORTFOLIO_ANALYTICS_OPT_OUT_KEY) {
        return;
      }
      setOptedOut(readPortfolioAnalyticsOptOut());
    };

    window.addEventListener("storage", syncPreference);
    window.addEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, syncPreference);

    return () => {
      window.removeEventListener("storage", syncPreference);
      window.removeEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, syncPreference);
    };
  }, []);

  const updatePreference = (nextValue) => {
    const saved = writePortfolioAnalyticsOptOut(nextValue);
    if (!saved) {
      setStorageUnavailable(true);
      return;
    }

    setStorageUnavailable(false);
    setOptedOut(nextValue);
    window.dispatchEvent(new Event(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT));
  };

  return (
    <div className="border border-border bg-surface-1 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3 className="text-sm font-semibold text-text-primary">
            Optional first-party page analytics
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            When the site owner enables analytics, this browser can send limited page-visit,
            device-category, approximate location and source information to the portfolio.
            This preference is stored only in this browser profile.
          </p>
        </div>

        <label className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-3 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={ready && optedOut}
            disabled={!ready}
            onChange={(event) => updatePreference(event.target.checked)}
            className="size-4 accent-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          />
          <span className="font-medium">
            Disable analytics on this browser
          </span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className={optedOut ? "text-success" : "text-text-tertiary"}>
          {ready
            ? optedOut
              ? "Analytics are disabled for this browser profile."
              : "Analytics preference: allowed if the site feature is enabled."
            : "Reading this browser’s preference…"}
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
