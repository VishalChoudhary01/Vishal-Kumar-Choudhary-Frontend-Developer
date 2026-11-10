const RESERVED_COMPILER_FILE_NAMES = new Set([
  "package.json",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "tsconfig.json",
  "jsconfig.json",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.mts",
  "postcss.config.js",
  "postcss.config.mjs",
  "postcss.config.cjs",
  "postcss.config.ts",
]);

/**
 * Rejects files that could alter the platform-owned compiler environment.
 * Apply the check to every path segment so nested package/config files cannot
 * shadow the fixed project toolchain.
 */
export function isReservedCompilerFilePath(filePath) {
  if (typeof filePath !== "string" || !filePath) return true;

  return filePath
    .toLowerCase()
    .split("/")
    .some((segment) => (
      segment === "node_modules" ||
      RESERVED_COMPILER_FILE_NAMES.has(segment)
    ));
}
