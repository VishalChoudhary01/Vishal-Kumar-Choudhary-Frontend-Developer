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

  return (
    experiments.find(
      (experiment) =>
        experiment?.slug === featuredSlug &&
        typeof experiment.title === "string" &&
        experiment.title.trim().length > 0,
    ) || null
  );
}
