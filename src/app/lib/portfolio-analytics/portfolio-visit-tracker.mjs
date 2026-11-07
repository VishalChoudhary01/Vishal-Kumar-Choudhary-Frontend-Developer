"use client";

import {
  buildPortfolioVisitStartPayload,
  getPortfolioReferrerHost,
} from "./tracker-payload.mjs";

const API_PATH = "/api/v1/portfolio/visits";
const SESSION_STORAGE_KEY = "vkr:portfolio-analytics:tab-session:v1";
const LANDING_ATTRIBUTION_KEY = "vkr:portfolio-analytics:landing-attributed:v1";
const HEARTBEAT_INTERVAL_MS = 15_000;
const RELEASE_GRACE_MS = 2_500;

let activeVisit = null;
let currentPath = null;
let releaseTimer = null;
let leaseCount = 0;
let lifecycleListenersAttached = false;

function createUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function getTabSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = createUuid();
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    // No long-lived cookie or fingerprint fallback when storage is blocked.
    return null;
  }
}

function isCanonicalProductionHost() {
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!canonicalUrl) return false;

  try {
    const expected = new URL(canonicalUrl).hostname.toLowerCase();
    return window.location.hostname.toLowerCase() === expected;
  } catch {
    return false;
  }
}

function lifecycleBody(action, visit) {
  if (!visit?.visitId || !visit?.tabSessionId) return null;
  return {
    action,
    visitId: visit.visitId,
    tabSessionId: visit.tabSessionId,
  };
}

function sendLifecycleForVisit(action, visit, { beacon = false, keepalive = false } = {}) {
  const body = lifecycleBody(action, visit);
  if (!body) return false;

  const serialized = JSON.stringify(body);

  if (
    beacon &&
    typeof navigator.sendBeacon === "function" &&
    typeof Blob === "function"
  ) {
    try {
      const queued = navigator.sendBeacon(
        API_PATH,
        new Blob([serialized], { type: "application/json" }),
      );
      if (queued) return true;
    } catch {
      // Fall through to same-origin keepalive fetch.
    }
  }

  try {
    void fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
      credentials: "same-origin",
      keepalive,
      cache: "no-store",
    }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

function stopHeartbeat(visit) {
  if (visit?.heartbeatTimer) {
    window.clearInterval(visit.heartbeatTimer);
    visit.heartbeatTimer = null;
  }
}

function startHeartbeat(visit) {
  if (
    !visit ||
    visit !== activeVisit ||
    visit.heartbeatTimer ||
    document.visibilityState !== "visible" ||
    !visit.visitId
  ) {
    return;
  }

  visit.heartbeatTimer = window.setInterval(() => {
    if (
      activeVisit !== visit ||
      document.visibilityState !== "visible" ||
      !visit.visitId ||
      visit.heartbeatInFlight
    ) {
      return;
    }

    visit.heartbeatInFlight = true;
    const body = lifecycleBody("heartbeat", visit);

    void fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    })
      .catch(() => {})
      .finally(() => {
        visit.heartbeatInFlight = false;
      });
  }, HEARTBEAT_INTERVAL_MS);
}

function pauseVisit() {
  const visit = activeVisit;
  if (!visit || visit.paused) return;

  visit.paused = true;
  stopHeartbeat(visit);
  sendLifecycleForVisit("pause", visit, { beacon: true, keepalive: true });
}

function resumeVisit() {
  const visit = activeVisit;
  if (!visit || !visit.paused || !visit.visitId) return;

  visit.paused = false;
  sendLifecycleForVisit("resume", visit);
  startHeartbeat(visit);
}

function detachLifecycleListeners() {
  if (!lifecycleListenersAttached) return;

  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("pagehide", onPageHide);
  window.removeEventListener("pageshow", onPageShow);
  lifecycleListenersAttached = false;
}

function endVisit({ beacon = true } = {}) {
  const visit = activeVisit;

  if (visit) {
    stopHeartbeat(visit);

    if (visit.visitId && !visit.ended) {
      visit.ended = true;
      sendLifecycleForVisit("end", visit, { beacon, keepalive: true });
    } else {
      // If the start request is still pending, its response handler will close
      // the server-created record as soon as the visit ID is known.
      visit.ended = true;
    }
  }

  activeVisit = null;
  detachLifecycleListeners();
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    pauseVisit();
  } else if (activeVisit?.paused) {
    resumeVisit();
  } else if (!activeVisit && leaseCount > 0 && currentPath) {
    void beginVisit(currentPath);
  }
}

function onPageHide(event) {
  if (event.persisted) {
    pauseVisit();
    return;
  }

  endVisit({ beacon: true });
}

function onPageShow(event) {
  if (event.persisted) {
    if (activeVisit?.paused) resumeVisit();
    else if (!activeVisit && leaseCount > 0 && currentPath) void beginVisit(currentPath);
  }
}

function attachLifecycleListeners() {
  if (lifecycleListenersAttached) return;

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  lifecycleListenersAttached = true;
}

function markLandingAttributionCaptured() {
  try {
    sessionStorage.setItem(LANDING_ATTRIBUTION_KEY, "1");
  } catch {
    // The visit remains valid without same-tab attribution persistence.
  }
}

function hasLandingAttribution() {
  try {
    return sessionStorage.getItem(LANDING_ATTRIBUTION_KEY) === "1";
  } catch {
    return false;
  }
}

async function beginVisit(pathname) {
  if (
    activeVisit ||
    !pathname ||
    document.visibilityState !== "visible"
  ) {
    return;
  }

  const tabSessionId = getTabSessionId();
  if (!tabSessionId) return;

  const isInternalNavigation = hasLandingAttribution();
  const referrerHost = isInternalNavigation
    ? null
    : getPortfolioReferrerHost(document.referrer, window.location.hostname);

  const payload = buildPortfolioVisitStartPayload({
    pathname,
    tabSessionId,
    idempotencyKey: createUuid(),
    search: window.location.search,
    referrerHost,
    isInternalNavigation,
  });

  if (!payload) return;

  const visit = {
    pathname,
    tabSessionId,
    visitId: null,
    heartbeatTimer: null,
    heartbeatInFlight: false,
    paused: document.visibilityState !== "visible",
    ended: false,
  };
  activeVisit = visit;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      if (activeVisit === visit) activeVisit = null;
      return;
    }

    const result = await response.json();
    const visitId = result?.data?.visitId;
    if (typeof visitId !== "string") {
      if (activeVisit === visit) activeVisit = null;
      return;
    }

    visit.visitId = visitId;
    markLandingAttributionCaptured();

    if (activeVisit !== visit || visit.ended) {
      sendLifecycleForVisit("end", visit, { beacon: true, keepalive: true });
      return;
    }

    if (document.visibilityState === "visible" && !visit.paused) {
      startHeartbeat(visit);
    } else {
      visit.paused = true;
      sendLifecycleForVisit("pause", visit, { beacon: true, keepalive: true });
    }
  } catch {
    if (activeVisit === visit) activeVisit = null;
  } finally {
    window.clearTimeout(timeout);
  }
}

function acquire(pathname) {
  if (releaseTimer) {
    window.clearTimeout(releaseTimer);
    releaseTimer = null;
  }

  leaseCount += 1;
  currentPath = pathname;

  if (activeVisit?.pathname !== pathname) {
    if (activeVisit) endVisit({ beacon: true });

    attachLifecycleListeners();
    if (document.visibilityState === "visible") {
      void beginVisit(pathname);
    }
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;
    leaseCount = Math.max(0, leaseCount - 1);

    if (releaseTimer) window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      releaseTimer = null;
      if (leaseCount === 0) {
        currentPath = null;
        endVisit({ beacon: true });
      }
    }, RELEASE_GRACE_MS);
  };
}

/**
 * Module-level lease avoids duplicate visits during React Strict Mode replay
 * and overlapping public route-shell transitions.
 */
export function acquirePortfolioVisitTracking(pathname) {
  if (
    process.env.NEXT_PUBLIC_PORTFOLIO_ANALYTICS_ENABLED !== "true" ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !isCanonicalProductionHost()
  ) {
    return () => {};
  }

  return acquire(pathname);
}
