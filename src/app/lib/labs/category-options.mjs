/**
 * Build filter options from the currently eligible public experiment list.
 * Categories with no published entries are omitted; counts are never mocked.
 */
export function buildLabCategoryOptions(experiments = [], definitions = []) {
  const entries = Array.isArray(experiments) ? experiments : [];
  const categoryDefinitions = Array.isArray(definitions) ? definitions : [];
  const counts = new Map();

  for (const experiment of entries) {
    const category = experiment?.category;
    if (typeof category !== "string" || !category.trim()) continue;

    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return [
    { id: "all", label: "All", count: entries.length },
    ...categoryDefinitions
      .filter((category) => counts.has(category.name))
      .map((category) => ({
        ...category,
        count: counts.get(category.name),
      })),
  ];
}
