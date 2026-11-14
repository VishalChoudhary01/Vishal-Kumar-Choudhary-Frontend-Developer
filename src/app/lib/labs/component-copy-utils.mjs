export const MAX_COMPONENT_BUNDLE_FILES = 40;

export function normalizeComponentBundleFilePaths(filePaths) {
  if (
    !Array.isArray(filePaths) ||
    filePaths.length < 1 ||
    filePaths.length > MAX_COMPONENT_BUNDLE_FILES
  ) {
    throw new TypeError("A component bundle must contain between 1 and 40 files.");
  }

  const unique = new Set();
  for (const path of filePaths) {
    if (
      typeof path !== "string" ||
      !path ||
      path.length > 180 ||
      path.trim() !== path ||
      path.includes("\\0")
    ) {
      throw new TypeError("The component bundle contains an invalid file path.");
    }
    unique.add(path);
  }

  return [...unique].sort((a, b) => a.localeCompare(b, "en"));
}

export function hasCompletedComponentBundle(requiredFilePaths, copiedFilePaths) {
  if (!Array.isArray(requiredFilePaths) || requiredFilePaths.length === 0) {
    return false;
  }

  const copied = new Set(
    (Array.isArray(copiedFilePaths) ? copiedFilePaths : [])
      .filter((path) => typeof path === "string"),
  );

  return requiredFilePaths.every((path) => copied.has(path));
}

export function hashComponentBundleManifest(filePaths) {
  const paths = normalizeComponentBundleFilePaths(filePaths);
  // Stable manifest identity; this is an integrity key, not an authorization token.
  return paths.join("\n");
}
