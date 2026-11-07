import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [listing, detail, collection, hook, preview, sitemap] = await Promise.all([
  read("../src/app/labs/page.js"),
  read("../src/app/labs/[slug]/page.js"),
  read("../src/app/components/labs/LabsCollection.js"),
  read("../src/app/hooks/labs/useLabPublicCollection.js"),
  read("../src/app/components/labs/LabExperimentPreview.js"),
  read("../src/app/sitemap.js"),
]);

test("public Labs listing uses only the eligible MongoDB source page", () => {
  assert.ok(listing.includes("getPublishedCustomLabExperimentPage("));
  assert.ok(listing.includes("const experiments = customPage.experiments;"));
  assert.ok(listing.includes("const totalExperimentCount = customPage.totalCount;"));
  assert.ok(!listing.includes("publishedLabExperiments"));
  assert.ok(!listing.includes("FEATURED_LAB_EXPERIMENT_SLUG"));
  assert.ok(!listing.includes("builtInExperiments"));
});

test("public collection pagination does not prepend code-owned entries", () => {
  assert.ok(!collection.includes("builtInExperiments"));
  assert.ok(!hook.includes("builtInExperiments"));
  assert.ok(hook.includes("/api/v1/labs"));
  assert.ok(hook.includes("initialCustomPage"));
  assert.ok(hook.includes("buildLabCategoryOptions(firstPage.experiments"));
});

test("public detail metadata and route resolve custom published source records only", () => {
  assert.ok(detail.includes("getPublishedCustomLabExperimentBySlug(slug)"));
  assert.ok(!detail.includes("getPublishedLabExperimentBySlug"));
  assert.ok(!detail.includes("publishedLabExperiments"));
  assert.ok(!detail.includes("generateStaticParams"));
});

test("public media renderer never synthesizes per-slug preview artwork", () => {
  assert.ok(preview.includes("galleryPreview"));
  assert.ok(preview.includes("generatedPoster"));
  assert.ok(preview.includes("selectActiveGalleryPreview"));
  assert.ok(preview.includes("Preview media unavailable"));
  assert.ok(!preview.includes("LabArtwork"));
});

test("sitemap includes only source-eligible custom experiment URLs", () => {
  assert.ok(sitemap.includes("getPublishedCustomLabExperimentPage"));
  assert.ok(sitemap.includes('export const dynamic = "force-dynamic"'));
  assert.ok(!sitemap.includes("publishedLabExperiments"));
});
