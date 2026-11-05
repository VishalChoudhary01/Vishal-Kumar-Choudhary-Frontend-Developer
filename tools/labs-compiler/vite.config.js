import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";

const root = process.env.LABS_PROJECT_ROOT || "/vercel/sandbox/project";
const allowedPackages = new Set([
  "react",
  "react-dom",
  "motion",
  "lucide-react",
  "react-icons",
  "clsx",
  "tailwind-merge",
]);

function labsSourcePolicy() {
  return {
    name: "labs-source-policy",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !importer.startsWith(root + path.sep)) {
        return null;
      }

      if (source === "vite/modulepreload-polyfill") {
        return null;
      }

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

      if (source.startsWith("/")) {
        // Vite rewrites root-relative HTML asset references to absolute URLs
        // such as /src/main.jsx. Resolve these only within the experiment root.
        const resolved = path.resolve(root, "." + source);
        if (!resolved.startsWith(root + path.sep)) {
          this.error("Root-relative asset escapes the experiment root.");
        }
        return null;
      }

      const resolved = path.resolve(path.dirname(importer), source);
      if (!resolved.startsWith(root + path.sep)) {
        this.error("Import escapes the experiment root.");
      }
      return null;
    },
    transform(code, id) {
      if (!id.startsWith(root + path.sep)) {
        return null;
      }

      if (/\b(?:eval|Function)\s*\(/.test(code) || /\brequire\s*\(/.test(code)) {
        this.error("eval, Function and require are not supported in Labs experiments.");
      }
      if (/\bimport\s*\(\s*[^"']/.test(code)) {
        this.error("Dynamic imports must use a static string path.");
      }
      if (/(?:from\s*|import\s*)["'](?:node:|https?:|\/\/|\/)/.test(code)) {
        this.error("Node built-ins, remote URLs and absolute imports are blocked.");
      }
      if (/\b(?:process\.env|globalThis\.process|window\.parent|document\.cookie|localStorage|indexedDB)\b/.test(code)) {
        this.error("Access to application secrets, parent context and persistent app storage is blocked.");
      }

      if (id.endsWith(".css")) {
        if (/@import\s+(?:url\s*\(\s*["']?https?:|["']https?:)/i.test(code)) {
          this.error("Remote CSS imports are blocked.");
        }
        if (/url\s*\(\s*["']?https?:/i.test(code) && !/res\.cloudinary\.com/i.test(code)) {
          this.error("External CSS assets are blocked.");
        }
      }

      return null;
    },
  };
}

export default defineConfig({
  configFile: false,
  root,
  plugins: [labsSourcePolicy()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^tailwindcss$/,
        replacement: path.resolve(process.cwd(), "node_modules/tailwindcss/index.css"),
      },
    ],
  },
  esbuild: {
    jsx: "automatic",
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ base: root })],
    },
  },
  base: process.env.LABS_BUILD_BASE || "/",
  build: {
    outDir: process.env.LABS_BUILD_OUTPUT || "/vercel/sandbox/output",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: "esbuild",
    manifest: true,
  },
});
