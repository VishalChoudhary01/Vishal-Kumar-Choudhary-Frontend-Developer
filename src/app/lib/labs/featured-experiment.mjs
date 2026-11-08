/**
 * Resolve the spotlight from the exact eligible source-backed collection.
 * A preferred slug is optional; if it is absent or no longer eligible, use the
 * first valid item. Display data always comes from the eligible collection.
 */
export function resolveFeaturedExperiment(experiments = [], featuredSlug = null) {
  if (!Array.isArray(experiments)) return null;

  const isEligibleItem = (experiment) =>
    typeof experiment?.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(experiment.slug) &&
    typeof experiment.title === "string" &&
    experiment.title.trim().length > 0;

  const preferredSlug =
    typeof featuredSlug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featuredSlug)
      ? featuredSlug
      : null;

  return (
    (preferredSlug
      ? experiments.find(
          (experiment) =>
            isEligibleItem(experiment) && experiment.slug === preferredSlug,
        )
      : null) ||
    experiments.find(isEligibleItem) ||
    null
  );
}
