"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    let release = () => {};
    let idleHandle = null;
    let fallbackTimer = null;

    const activate = async () => {
      const tracker = await loadTrackerModule();

      if (!disposed && tracker?.acquirePortfolioVisitTracking) {
        release = tracker.acquirePortfolioVisitTracking(pathname);
      }
    };

    // Once the tracker has been loaded after the first idle period, subsequent
    // SPA path changes reuse the loaded module without another idle delay.
    if (trackerModulePromise) {
      void activate();
    } else if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(activate, {
        timeout: IDLE_TIMEOUT_MS,
      });
    } else {
      fallbackTimer = window.setTimeout(activate, FALLBACK_DELAY_MS);
    }

    return () => {
      disposed = true;

      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);

      release();
    };
  }, [pathname]);

  return null;
}
