/**
 * Build category filter options from the complete eligible collection summary.
 * When server counts are supplied, the local page is not mistaken for the
 * entire catalogue. Empty categories are still omitted.
 */
export function buildLabCategoryOptions(
  experiments = [],
  definitions = [],
  summary = {},
) {
  const entries = Array.isArray(experiments) ? experiments : [];
  const categoryDefinitions = Array.isArray(definitions) ? definitions : [];
  const categoryCounts =
    summary?.categoryCounts && typeof summary.categoryCounts === "object"
      ? summary.categoryCounts
      : null;

  const localCounts = new Map();
  for (const experiment of entries) {
    const category = experiment?.category;
    if (typeof category !== "string" || !category.trim()) continue;
    localCounts.set(category, (localCounts.get(category) || 0) + 1);
  }

  const allCount =
    Number.isSafeInteger(summary?.totalCount) && summary.totalCount >= 0
      ? summary.totalCount
      : entries.length;

  return [
    { id: "all", label: "All", count: allCount },
    ...categoryDefinitions
      .map((category) => {
        const serverCount = categoryCounts?.[category.name];
        const count = Number.isSafeInteger(serverCount) && serverCount >= 0
          ? serverCount
          : localCounts.get(category.name) || 0;

        return { ...category, count };
      })
      .filter((category) => category.count > 0),
  ];
}
