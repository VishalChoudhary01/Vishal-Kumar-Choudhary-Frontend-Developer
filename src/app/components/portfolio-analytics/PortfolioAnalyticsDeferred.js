"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  PORTFOLIO_ANALYTICS_PREFERENCE_EVENT,
  readPortfolioAnalyticsOptOut,
} from "@/app/lib/portfolio-analytics/privacy-preference.mjs";

const IDLE_TIMEOUT_MS = 2200;
const FALLBACK_DELAY_MS = 900;
let trackerModulePromise = null;

function loadTrackerModule() {
  if (!trackerModulePromise) {
    trackerModulePromise = import(
      "@/app/lib/portfolio-analytics/portfolio-visit-tracker.mjs"
    ).catch(() => {
      trackerModulePromise = null;
      return null;
    });
  }

  return trackerModulePromise;
}

export default function PortfolioAnalyticsDeferred() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PORTFOLIO_ANALYTICS_ENABLED !== "true") {
      return undefined;
    }

    let disposed = false;
    let tracker = null;
    let release = null;
    let idleHandle = null;
    let fallbackTimer = null;
    let loading = false;

    const stopTracking = () => {
      if (release) {
        release();
        release = null;
      }
      tracker?.stopPortfolioVisitTracking?.();
    };

    const activate = async () => {
      if (
        disposed ||
        loading ||
        readPortfolioAnalyticsOptOut()
      ) {
        return;
      }

      loading = true;
      const loaded = await loadTrackerModule();
      loading = false;

      if (disposed || !loaded) return;
      tracker = loaded;

      if (readPortfolioAnalyticsOptOut()) {
        stopTracking();
        return;
      }

      if (!release) {
        release = tracker.acquirePortfolioVisitTracking(pathname);
      }
    };

    const scheduleActivation = () => {
      if (
        disposed ||
        readPortfolioAnalyticsOptOut() ||
        idleHandle !== null ||
        fallbackTimer !== null ||
        loading ||
        tracker
      ) {
        return;
      }

      if (trackerModulePromise) {
        void activate();
        return;
      }

      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => {
          idleHandle = null;
          void activate();
        }, { timeout: IDLE_TIMEOUT_MS });
      } else {
        fallbackTimer = window.setTimeout(() => {
          fallbackTimer = null;
          void activate();
        }, FALLBACK_DELAY_MS);
      }
    };

    const handlePreferenceChange = () => {
      if (readPortfolioAnalyticsOptOut()) {
        if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleHandle);
          idleHandle = null;
        }
        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        stopTracking();
        return;
      }

      if (tracker && !release) {
        release = tracker.acquirePortfolioVisitTracking(pathname);
      } else {
        scheduleActivation();
      }
    };

    window.addEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, handlePreferenceChange);
    window.addEventListener("storage", handlePreferenceChange);

    scheduleActivation();

    return () => {
      disposed = true;
      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      window.removeEventListener(PORTFOLIO_ANALYTICS_PREFERENCE_EVENT, handlePreferenceChange);
      window.removeEventListener("storage", handlePreferenceChange);
      release?.();
      release = null;
    };
  }, [pathname]);

  return null;
}
