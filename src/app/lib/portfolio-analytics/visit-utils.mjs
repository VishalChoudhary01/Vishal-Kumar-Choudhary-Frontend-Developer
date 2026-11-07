export const PORTFOLIO_VISIT_PAGE_TYPES = Object.freeze([
  "home",
  "project",
  "labs_index",
  "lab_detail",
]);

export const PORTFOLIO_VISIT_SOURCE_TYPES = Object.freeze([
  "direct",
  "referral",
  "campaign",
  "internal",
]);

export const PORTFOLIO_VISIT_DEVICE_TYPES = Object.freeze([
  "desktop",
  "mobile",
  "tablet",
  "unknown",
]);

export const PORTFOLIO_VISIT_STATUSES = Object.freeze([
  "active",
  "paused",
  "ended",
  "expired",
]);

export const PORTFOLIO_VISIT_RETENTION_DAYS = 65;
export const PORTFOLIO_VISIT_RETENTION_MS =
  PORTFOLIO_VISIT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
export const PORTFOLIO_HEARTBEAT_MIN_INTERVAL_MS = 10_000;
export const PORTFOLIO_HEARTBEAT_MAX_DELTA_MS = 20_000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_LABS_SEGMENTS = new Set([
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
]);

function invalid(message) {
  const error = new TypeError(message);
  error.code = "INVALID_PORTFOLIO_VISIT";
  return error;
}

function assertPlainObject(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw invalid("A JSON object is required.");
  }
}

function assertOnlyKeys(value, allowedKeys) {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw invalid("Unexpected request field.");
  }
}

function normalizeSlug(value) {
  if (
    typeof value !== "string" ||
    value.length > 80 ||
    !SLUG_PATTERN.test(value)
  ) {
    return null;
  }
  return value;
}

export function resolvePortfolioVisitPage(pathname) {
  if (typeof pathname !== "string" || pathname.length > 200) return null;
  if (pathname.includes("?") || pathname.includes("#") || pathname.includes("\\") || pathname.includes("%")) {
    return null;
  }

  const path = pathname.length > 1
    ? pathname.replace(/\/+$/, "")
    : pathname;

  if (path === "/") {
    return { pageType: "home", path: "/", slug: null };
  }

  if (path === "/labs") {
    return { pageType: "labs_index", path: "/labs", slug: null };
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slug = normalizeSlug(projectMatch[1]);
    return slug ? { pageType: "project", path: `/projects/${slug}`, slug } : null;
  }

  const labMatch = path.match(/^\/labs\/([^/]+)$/);
  if (labMatch) {
    const slug = normalizeSlug(labMatch[1]);
    if (!slug || RESERVED_LABS_SEGMENTS.has(slug)) return null;

    return {
      pageType: "lab_detail",
      path: `/labs/${slug}`,
      slug,
    };
  }

  return null;
}

function normalizeReferrerHost(value) {
  if (typeof value !== "string" || value.length > 253) {
    throw invalid("Referrer host is invalid.");
  }

  const candidate = value.trim().toLowerCase();
  if (
    !candidate ||
    candidate.includes("/") ||
    candidate.includes("@") ||
    candidate.includes(":") ||
    candidate.includes("?") ||
    candidate.includes("#")
  ) {
    throw invalid("Referrer host is invalid.");
  }

  try {
    const parsed = new URL(`https://${candidate}`);
    if (
      parsed.hostname !== candidate ||
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(candidate)
    ) {
      throw invalid("Referrer host is invalid.");
    }
    return parsed.hostname;
  } catch {
    throw invalid("Referrer host is invalid.");
  }
}

function normalizeCampaignValue(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw invalid("Campaign values must be strings.");

  const normalized = value.trim().replace(/\s+/g, " ");
  if (
    normalized.length > 80 ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/.test(normalized)
  ) {
    throw invalid("Campaign value is invalid.");
  }

  return normalized.toLowerCase();
}

export function parsePortfolioVisitStartPayload(payload) {
  assertPlainObject(payload);
  assertOnlyKeys(payload, [
    "action",
    "path",
    "tabSessionId",
    "idempotencyKey",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "referrerHost",
    "isInternalNavigation",
  ]);

  if (payload.action !== "start") throw invalid("Start action is required.");

  const page = resolvePortfolioVisitPage(payload.path);
  if (!page) throw invalid("This public route is not eligible for analytics.");

  if (typeof payload.tabSessionId !== "string" || !UUID_PATTERN.test(payload.tabSessionId)) {
    throw invalid("A valid tab session identifier is required.");
  }
  if (typeof payload.idempotencyKey !== "string" || !UUID_PATTERN.test(payload.idempotencyKey)) {
    throw invalid("A valid idempotency key is required.");
  }

  const referrerHost =
    payload.referrerHost === undefined || payload.referrerHost === null || payload.referrerHost === ""
      ? null
      : normalizeReferrerHost(payload.referrerHost);

  if (
    payload.isInternalNavigation !== undefined &&
    typeof payload.isInternalNavigation !== "boolean"
  ) {
    throw invalid("Internal navigation flag must be boolean.");
  }

  return {
    action: "start",
    ...page,
    tabSessionId: payload.tabSessionId.toLowerCase(),
    idempotencyKey: payload.idempotencyKey.toLowerCase(),
    utmSource: normalizeCampaignValue(payload.utmSource),
    utmMedium: normalizeCampaignValue(payload.utmMedium),
    utmCampaign: normalizeCampaignValue(payload.utmCampaign),
    referrerHost,
    isInternalNavigation: payload.isInternalNavigation === true,
  };
}

export function parsePortfolioVisitLifecyclePayload(payload) {
  assertPlainObject(payload);
  assertOnlyKeys(payload, ["action", "visitId", "tabSessionId"]);

  if (!["heartbeat", "pause", "resume", "end"].includes(payload.action)) {
    throw invalid("Unsupported visit lifecycle action.");
  }
  if (typeof payload.visitId !== "string" || !UUID_PATTERN.test(payload.visitId)) {
    throw invalid("A valid visit identifier is required.");
  }
  if (typeof payload.tabSessionId !== "string" || !UUID_PATTERN.test(payload.tabSessionId)) {
    throw invalid("A valid tab session identifier is required.");
  }

  return {
    action: payload.action,
    visitId: payload.visitId.toLowerCase(),
    tabSessionId: payload.tabSessionId.toLowerCase(),
  };
}

function readHeader(headers, name) {
  if (!headers || typeof headers.get !== "function") return null;
  const value = headers.get(name);
  return typeof value === "string" ? value : null;
}

function safeCity(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }

  const normalized = decoded
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  return normalized || null;
}

/**
 * Uses only Vercel's coarse IP-derived location headers.
 * No address, latitude, longitude, postal code or raw IP is returned.
 */
export function readPortfolioLocation(headers) {
  const country = readHeader(headers, "x-vercel-ip-country")?.trim().toUpperCase();
  const region = readHeader(headers, "x-vercel-ip-country-region")?.trim().toUpperCase();
  const city = safeCity(readHeader(headers, "x-vercel-ip-city"));

  return {
    countryCode: country && /^[A-Z]{2}$/.test(country) ? country : null,
    regionCode: region && /^[A-Z0-9]{1,3}$/.test(region) ? region : null,
    city,
  };
}

export function classifyPortfolioDevice(userAgent) {
  if (typeof userAgent !== "string" || !userAgent.trim()) return "unknown";

  const value = userAgent.toLowerCase();

  if (/ipad|tablet|kindle|silk|playbook/.test(value)) return "tablet";
  if (/android/.test(value) && !/mobile/.test(value)) return "tablet";
  if (/mobile|iphone|ipod|windows phone|iemobile/.test(value)) return "mobile";

  return "desktop";
}

function normalizeHost(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(`https://${value.trim()}`);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function resolvePortfolioAttribution({
  referrer,
  ownHosts = [],
  utmSource = null,
  utmMedium = null,
  utmCampaign = null,
  isInternalNavigation = false,
} = {}) {
  const ownHostSet = new Set(
    ownHosts.map(normalizeHost).filter(Boolean),
  );

  let referrerHost = null;
  if (typeof referrer === "string" && referrer.trim()) {
    try {
      const parsed = new URL(referrer);
      if (
        ["http:", "https:"].includes(parsed.protocol) &&
        !parsed.username &&
        !parsed.password
      ) {
        const candidate = parsed.hostname.toLowerCase();
        if (!ownHostSet.has(candidate) && candidate !== "localhost") {
          referrerHost = candidate.slice(0, 253);
        }
      }
    } catch {
      // Invalid referrers are intentionally discarded.
    }
  }

  const hasCampaign = Boolean(utmSource || utmMedium || utmCampaign);
  const isInternal = typeof referrer === "string" && (() => {
    try {
      return ownHostSet.has(new URL(referrer).hostname.toLowerCase());
    } catch {
      return false;
    }
  })();

  const sourceType = isInternalNavigation
    ? "internal"
    : hasCampaign
      ? "campaign"
      : isInternal
        ? "internal"
        : referrerHost
          ? "referral"
          : "direct";

  return {
    sourceType,
    referrerHost,
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
  };
}

export function calculatePortfolioHeartbeatDelta({
  lastHeartbeatAt,
  now = new Date(),
  minimumIntervalMs = PORTFOLIO_HEARTBEAT_MIN_INTERVAL_MS,
  maximumDeltaMs = PORTFOLIO_HEARTBEAT_MAX_DELTA_MS,
} = {}) {
  const previous = new Date(lastHeartbeatAt);
  const current = new Date(now);
  const minimum = Number(minimumIntervalMs);
  const maximum = Number(maximumDeltaMs);

  if (
    Number.isNaN(previous.getTime()) ||
    Number.isNaN(current.getTime()) ||
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    minimum <= 0 ||
    maximum < minimum
  ) {
    return { accepted: false, deltaSeconds: 0 };
  }

  const elapsed = current.getTime() - previous.getTime();
  if (elapsed < minimum) return { accepted: false, deltaSeconds: 0 };

  return {
    accepted: true,
    deltaSeconds: Math.floor(Math.min(elapsed, maximum) / 1000),
  };
}

export function getPortfolioVisitExpiry(startedAt) {
  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime())) throw new TypeError("startedAt must be a valid date.");
  return new Date(start.getTime() + PORTFOLIO_VISIT_RETENTION_MS);
}
