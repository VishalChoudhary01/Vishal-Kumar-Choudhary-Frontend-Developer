export const PORTFOLIO_ANALYTICS_OPT_OUT_KEY =
  "vkr:portfolio-analytics:opt-out:v1";
export const PORTFOLIO_ANALYTICS_PREFERENCE_EVENT =
  "portfolio-analytics:preference-change";

export function readPortfolioAnalyticsOptOut(storage) {
  try {
    const target = storage || (
      typeof window !== "undefined" ? window.localStorage : null
    );
    return target?.getItem(PORTFOLIO_ANALYTICS_OPT_OUT_KEY) === "1";
  } catch {
    // When the preference cannot be read, do not infer an opt-out.
    // No tracking still occurs unless both feature flags are explicitly enabled.
    return false;
  }
}

export function writePortfolioAnalyticsOptOut(optedOut, storage) {
  try {
    const target = storage || (
      typeof window !== "undefined" ? window.localStorage : null
    );

    if (!target) return false;

    if (optedOut) target.setItem(PORTFOLIO_ANALYTICS_OPT_OUT_KEY, "1");
    else target.removeItem(PORTFOLIO_ANALYTICS_OPT_OUT_KEY);
    return true;
  } catch {
    return false;
  }
}
