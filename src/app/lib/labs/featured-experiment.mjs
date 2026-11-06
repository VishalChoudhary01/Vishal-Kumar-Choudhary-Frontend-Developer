/**
 * Resolve the selected spotlight from the exact collection used by the gallery.
 * The selection is a slug only; display data always comes from the eligible item.
 */
export function resolveFeaturedExperiment(experiments = [], featuredSlug = "") {
  if (
    !Array.isArray(experiments) ||
    typeof featuredSlug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featuredSlug)
  ) {
    return null;
  }

  const isEligibleItem = (experiment) =>
    typeof experiment?.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(experiment.slug) &&
    typeof experiment.title === "string" &&
    experiment.title.trim().length > 0;

  return (
    experiments.find(
      (experiment) =>
        isEligibleItem(experiment) && experiment.slug === featuredSlug,
    ) ||
    experiments.find(isEligibleItem) ||
    null
  );
}
