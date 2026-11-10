export const PORTFOLIO_ANALYTICS_POLL_INTERVALS = Object.freeze({
  summary: 10_000,
  recent: 30_000,
});

export const PORTFOLIO_ANALYTICS_MAX_POLL_BACKOFF_MS = 60_000;

export function getPortfolioAnalyticsPollDelay({
  interval,
  failures = 0,
  maximum = PORTFOLIO_ANALYTICS_MAX_POLL_BACKOFF_MS,
} = {}) {
  const base = Number(interval);
  const failureCount = Math.max(0, Math.floor(Number(failures) || 0));
  const cap = Number(maximum);

  if (
    !Number.isFinite(base) ||
    base <= 0 ||
    !Number.isFinite(cap) ||
    cap <= 0
  ) {
    return PORTFOLIO_ANALYTICS_MAX_POLL_BACKOFF_MS;
  }

  return Math.min(base * (2 ** failureCount), cap);
}

export function shouldPollPortfolioAnalytics(visibilityState) {
  return visibilityState === "visible";
}
