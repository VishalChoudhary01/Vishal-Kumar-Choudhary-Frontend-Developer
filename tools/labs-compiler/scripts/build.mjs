import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { build } from "vite";

const INPUT = process.env.LABS_BUILD_INPUT || "/vercel/sandbox/input";
const ROOT = process.env.LABS_PROJECT_ROOT || "/vercel/sandbox/project";
const OUTPUT = process.env.LABS_BUILD_OUTPUT || "/vercel/sandbox/output";
const MAX_FILES = 40;
const MAX_TOTAL_BYTES = 1000000;
const MAX_FILE_BYTES = 500000;
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

function validateAssets(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("INVALID_ASSET_MANIFEST", "The fallback asset manifest is invalid."¶»§q«^