import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";

const root = process.env.LABS_PROJECT_ROOT || "/vercel/sandbox/project";
const allowedPackages = new Set([
  "react",
  "react-dom",
  "motion",
  "lucide-react",
  "clsx",
  "tailwind-merge",
]);

function labsSourcePolicy() {
  return {
    name: "labs-source-policy",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !importer.startsWith(root + path.sep)) return null;
      if (source === "vite/modulepreload-polyfill") return null;
      if (source === "@labs/assets") return "\0labs-assets";

      if (!source.startsWith(".") && !source.startsWith("/")) {
        const packageName = source.startsWith("@")
          ? source.split("/").slice(0, 2).join("/")
          : source.split("/")[0];

        if (!allowedPackages.has(packageName)) {
          this.error("Package is not allowed in Labs: " + packageName);
        }
        if (packageName === "motion" && source !== "motion/react") {
          this.error("Import Motion from motion/react.");
        }
        return null;
      }

      if (source.startsWith("/")) this.error("Absolute file imports are not allowed.");
      const resolved = path.resolve(path.dirname(importer), source);
      if (!resolved.startsWith(root + path.sep)) {
        this.error("Import escapes the experiment root.");
      }
      return null;
    },
    load(id) {
      if (id === "\0labs-assets") {
     ¶»§q«^