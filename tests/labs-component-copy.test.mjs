import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  MAX_COMPONENT_BUNDLE_FILES,
  normalizeComponentBundleFilePaths,
  hasCompletedComponentBundle,
  hashComponentBundleManifest,
} from "../src/app/lib/labs/component-copy-utils.mjs";

test("component bundle paths are validated, unique and deterministically ordered", () => {
  const paths = normalizeComponentBundleFilePaths([
    "src/App.jsx",
    "package.json",
    "src/styles.css",
  ]);

  assert.deepEqual(paths, ["package.json", "src/App.jsx", "src/styles.css"]);
  assert.throws(
    () => normalizeComponentBundleFilePaths(["src/App.jsx", "src/App.jsx"]),
    { name: "TypeError" },
  );
  assert.throws(
    () => normalizeComponentBundleFilePaths([""]),
    { name: "TypeError" },
  );
  assert.throws(
    () => normalizeComponentBundleFilePaths([" src/App.jsx"]),
    { name: "TypeError" },
  );
  assert.throws(
    () => normalizeComponentBundleFilePaths(["x".repeat(181)]),
    { name: "TypeError" },
  );
});

test("component bundle size is bounded without changing the individual file-copy flow", () => {
  const allowed = Array.from({ length: MAX_COMPONENT_BUNDLE_FILES }, (_, index) => `src/file-${index}.js`);
  assert.equal(normalizeComponentBundleFilePaths(allowed).length, 40);
  assert.throws(
    () => normalizeComponentBundleFilePaths([...allowed, "src/file-40.js"]),
    { name: "TypeError" },
  );
});

test("component copy completes only after every published file has been copied", () => {
  const required = ["src/App.jsx", "src/styles.css", "package.json"];

  assert.equal(hasCompletedComponentBundle(required, ["src/App.jsx"]), false);
  assert.equal(hasCompletedComponentBundle(required, ["src/App.jsx", "package.json"]), false);
  assert.equal(
    hasCompletedComponentBundle(required, ["src/App.jsx", "src/styles.css", "package.json"]),
    true,
  );
  assert.equal(hasCompletedComponentBundle([], required), false);
  assert.equal(hasCompletedComponentBundle(required, null), false);
});

test("component bundle manifest hash is stable and changes when its contents change", () => {
  const first = hashComponentBundleManifest(["src/App.jsx", "package.json"]);
  const reordered = hashComponentBundleManifest(["package.json", "src/App.jsx"]);
  const changed = hashComponentBundleManifest(["src/App.jsx", "package.json", "src/styles.css"]);

  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
});

test("records one component copy per account, experiment and published version", async () => {
  const [service, model] = await Promise.all([
    readFile(new URL("../src/app/lib/labs/engagement.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/lib/labs/models/LabComponentCopyProgress.js", import.meta.url), "utf8"),
  ]);

  assert.match(service, /const completionKey = createHash\("sha256"\)/);
  assert.match(service, /const eventId = "component_" \+ completionKey/);
  assert.match(service, /LabAnalyticsEvent\.updateOne\(\s*\{ eventId \}/);
  assert.match(model, /lab_component_copy_actor_version_unique/);
  assert.match(model, /\{ userId: 1, experimentSlug: 1, sourceVersionId: 1 \}/);
});

test("component bundle progress reuses valid file copies from the same published version", async () => {
  const service = await readFile(
    new URL("../src/app/lib/labs/engagement.js", import.meta.url),
    "utf8",
  );
  assert.match(service, /LabAnalyticsEvent\.distinct\("filePath"/);
  assert.match(service, /eventType: "code_copy"/);
  assert.match(service, /sourceVersion,/);
});
