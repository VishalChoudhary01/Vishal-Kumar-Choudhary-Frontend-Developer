import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nested Trebopack build output inside src (do not lint):
    "src/.next/**",
    // Alternate verification builds (NEXT_DIST_DIR=.next-p9 etc.):
    ".next-*/**",
  ]),
]);

export default eslintConfig;
