import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { build } from "vite";

const INPUT = process.env.LABS_BUILD_INPUT || "/vercel/sandbox/input";
const ROOT = process.env.LABS_PROJECT_ROOT || "/vercel/sandbox/project";
const OUTPUT = process.env.LABS_BUILD_OUTPUT || "/vercel/sandbox/output";
const MAX_FILES = 40;
const MAX_TOTAL_BYTES = 1_000_000;
const MAX_FILE_BYTES = 500_000;
const ALLOWED_EXTENSIONS = new Set(["html", "js", "jsx", "mjs", "css", "json", "txt", "md"]);
const SAFE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function validatePath(value) {
  if (
    typeof value !== "string" ||
    !SAFE_PATH.test(value) ||
    value.includes("\\") ||
    value.split("/").some((part) =>
      !part || part === "." || part === ".." || part.startsWith(".") || part === "node_modules"
    )
  ) {
    fail("INVALID_PATH", "A source file path is invalid or contains a restricted segment.");
  }

  const extension = path.posix.extname(value).slice(1).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    fail("UNSUPPORTED_FILE", "Unsupported source file extension: " + extension);
  }
  return value;
}

async function collectOutput(directory, prefix = "") {
  const records = [];
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, item.name);
    const relative = path.posix.join(prefix, item.name);
    if (item.isSymbolicLink()) {
      fail("OUTPUT_SYMLINK", "Compiler output cannot contain symbolic links.");
    }
    if (item.isDirectory()) {
      records.push(...await collectOutput(absolute, relative));
    } else if (item.isFile()) {
      const content = await fs.readFile(absolute);
      records.push({ path: relative, bytes: content.length, content });
    }
  }
  return records;
}

async function main() {
  const inputFiles = JSON.parse(await fs.readFile(path.join(INPUT, "files.json"), "utf8"));
  const assetManifest = JSON.parse(await fs.readFile(path.join(INPUT, "assets.json"), "utf8"));

  if (!Array.isArray(inputFiles) || inputFiles.length < 1 || inputFiles.length > MAX_FILES) {
    fail("INVALID_FILE_COUNT", "Add between 1 and 40 source files.");
  }
  if (
    !assetManifest ||
    typeof assetManifest !== "object" ||
    Array.isArray(assetManifest) ||
    Object.keys(assetManifest).length > 0
  ) {
    fail(
      "UNSUPPORTED_ASSETS",
      "Runtime asset imports are disabled. Image, GIF and video remain optional page-level fallbacks only.",
    );
  }

  const files = new Map();
  let totalBytes = 0;
  for (const item of inputFiles) {
    const filePath = validatePath(item?.path);
    const normalizedPath = filePath.toLowerCase();
    if (files.has(normalizedPath)) {
      fail("DUPLICATE_PATH", "Duplicate source path: " + filePath);
    }
    if (typeof item.content !== "string") {
      fail("INVALID_CONTENT", "Every source file must contain text.");
    }

    const bytes = Buffer.byteLength(item.content, "utf8");
    if (bytes > MAX_FILE_BYTES) {
      fail("FILE_TOO_LARGE", "A source file exceeds 500 KB: " + filePath);
    }
    totalBytes += bytes;
    if (totalBytes > MAX_TOTAL_BYTES) {
      fail("SNAPSHOT_TOO_LARGE", "The complete source snapshot exceeds 1 MB.");
    }
    files.set(filePath, item.content);
  }

  for (const required of ["index.html", "src/main.jsx", "src/App.jsx", "src/index.css"]) {
    if (!files.has(required)) {
      fail("MISSING_ENTRY", "React project is missing " + required + ".");
    }
  }
  if (!/<div\s+id=["']root["']\s*>/i.test(files.get("index.html"))) {
    fail("INVALID_HTML_ENTRY", "index.html must include <div id=\"root\"></div>.");
  }
  if (!/<script[^>]+type=["']module["'][^>]+src=["']\.\/src\/main\.jsx["']/i.test(files.get("index.html"))) {
    fail("INVALID_HTML_ENTRY", "index.html must load ./src/main.jsx as a module entry.");
  }
  if (!/createRoot\s*\(/.test(files.get("src/main.jsx"))) {
    fail("INVALID_REACT_ENTRY", "src/main.jsx must mount the application with ReactDOM createRoot().");
  }
  if (!/@import\s+["']tailwindcss["']\s*;/.test(files.get("src/index.css"))) {
    fail("INVALID_TAILWIND_ENTRY", "src/index.css must include @import \"tailwindcss\";.");
  }

  await fs.rm(ROOT, { recursive: true, force: true });
  await fs.mkdir(ROOT, { recursive: true });
  await fs.symlink(path.resolve(process.cwd(), "node_modules"), path.join(ROOT, "node_modules"), "dir");

  for (const [filePath, source] of files) {
    const destination = path.join(ROOT, filePath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, source, "utf8");
  }

  process.env.LABS_PROJECT_ROOT = ROOT;
  process.env.LABS_ASSET_MAP = "{}";
  await fs.rm(OUTPUT, { recursive: true, force: true });

  await build({
    configFile: path.resolve(process.cwd(), "vite.config.js"),
    root: ROOT,
    mode: "production",
    logLevel: "error",
    appType: "spa",
    build: {
      outDir: OUTPUT,
      emptyOutDir: true,
      assetsDir: "assets",
      sourcemap: false,
      minify: "esbuild",
      cssMinify: "esbuild",
      manifest: true,
    },
  });

  const htmlPath = path.join(OUTPUT, "index.html");
  let html = await fs.readFile(htmlPath, "utf8");
  const headStart = html.toLowerCase().indexOf("<head");
  const headEnd = html.indexOf(">", headStart);
  if (headStart < 0 || headEnd < 0) {
    fail("INVALID_HTML_OUTPUT", "The compiled HTML document is missing its head element.");
  }

  const quote = String.fromCharCode(39);
  const runtimePolicy = [
    "default-src " + quote + "none" + quote,
    "script-src " + quote + "self" + quote + " " + quote + "unsafe-inline" + quote,
    "style-src " + quote + "self" + quote + " " + quote + "unsafe-inline" + quote,
    "img-src " + quote + "self" + quote + " data: blob:",
    "font-src " + quote + "self" + quote + " data:",
    "media-src " + quote + "self" + quote + " data: blob:",
    "connect-src " + quote + "none" + quote,
    "frame-src " + quote + "none" + quote,
    "object-src " + quote + "none" + quote,
    "base-uri " + quote + "none" + quote,
    "form-action " + quote + "none" + quote,
    "worker-src " + quote + "none" + quote,
  ].join("; ");
  const cspTag =
    '<meta http-equiv="Content-Security-Policy" content="' + runtimePolicy + '">';
  html = html.slice(0, headEnd + 1) + cspTag + html.slice(headEnd + 1);
  await fs.writeFile(htmlPath, html, "utf8");

  const records = await collectOutput(OUTPUT);
  const digest = createHash("sha256");
  const outputFiles = records.map(({ path: filePath, bytes, content }) => {
    digest.update(filePath);
    digest.update(content);
    return { path: filePath, bytes };
  });

  const result = {
    success: true,
    buildHash: digest.digest("hex"),
    outputFiles,
    compiler: {
      vite: "8.3.5",
      react: "19.2.8",
      reactDom: "19.2.8",
      motion: "13.2.0",
      tailwind: "4.3.3",
      tailwindPostcss: "4.3.3",
      esbuild: "0.28.2",
    },
  };

  await fs.writeFile(path.join(OUTPUT, "labs-build-result.json"), JSON.stringify(result, null, 2));
  process.stdout.write(JSON.stringify({
    success: true,
    buildHash: result.buildHash,
    outputFileCount: outputFiles.length,
  }));
}

main().catch((error) => {
  process.stderr.write(JSON.stringify({
    success: false,
    code: error.code || "BUILD_FAILED",
    message: String(error.message || "The build failed.").slice(0, 1000),
  }));
  process.exitCode = 1;
});
