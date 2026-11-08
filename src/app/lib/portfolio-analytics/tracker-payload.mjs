import { resolvePortfolioVisitPage } from "./visit-utils.mjs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function getPortfolioReferrerHost(referrer, currentHost) {
  if (typeof referrer !== "string" || !referrer.trim()) return null;

  try {
    const parsed = new URL(referrer);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;

    const host = parsed.hostname.toLowerCase();
    if (!host || host === currentHost?.toLowerCase()) return null;

    return host.length <= 253 ? host : null;
  } catch {
    return null;
  }
}

export function buildPortfolioVisitStartPayload({
  pathname,
  tabSessionId,
  idempotencyKey,
  search = "",
  referrerHost = null,
  isInternalNavigation = false,
} = {}) {
  const page = resolvePortfolioVisitPage(pathname);
  if (!page || !isUuid(tabSessionId) || !isUuid(idempotencyKey)) return null;

  const params = new URLSearchParams(
    typeof search === "string" ? search.replace(/^\?/, "") : "",
  );

  const campaignValue = (key) => {
    const value = params.get(key);
    if (!value || value.length > 80) return null;
    return value;
  };

  if (isInternalNavigation) {
    return {
      action: "start",
      path: page.path,
      tabSessionId,
      idempotencyKey,
      isInternalNavigation: true,
    };
  }

  const utmSource = campaignValue("utm_source");
  const utmMedium = campaignValue("utm_medium");
  const utmCampaign = campaignValue("utm_campaign");

  return {
    action: "start",
    path: page.path,
    tabSessionId,
    idempotencyKey,
    ...(referrerHost ? { referrerHost } : {}),
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
  };
}
