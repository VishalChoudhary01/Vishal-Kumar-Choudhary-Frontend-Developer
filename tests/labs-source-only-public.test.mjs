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

const [
  ownerSourceManagement,
  ownerSourceInventory,
  legacyExperimentDefinitions,
  magneticInteractionRuntime,
  scrollDrivenTextRevealRuntime,
  gradientBloomRuntime,
  generativeParticleFieldRuntime,
  codeOwnedRuntimeRegistry,
  magneticButtonSourceProject,
] = await Promise.all([
  read("../src/app/lib/labs/source-management.js"),
  read("../src/app/components/labs/admin/LabSourceInventory.js"),
  read("../src/app/data/labsExperiments.js"),
  read("../src/app/components/labs/runtime/experiments/magnetic-interaction/index.js"),
  read("../src/app/components/labs/runtime/experiments/scroll-driven-text-reveal/index.js"),
  read("../src/app/components/labs/runtime/experiments/gradient-bloom/index.js"),
  read("../src/app/components/labs/runtime/experiments/generative-particle-field/index.js"),
  read("../src/app/components/labs/runtime/registry.js"),
  read("../src/app/lib/labs/magnetic-button-source-project.js"),
]);

test("owner source inventory lists owner-created experiments without legacy runtime rows", () => {
  const listStart = ownerSourceManagement.indexOf(
    "export async function listOwnerLabSources({ user })",
  );
  const listEnd = ownerSourceManagement.indexOf(
    "export async function createOwnerLabSource",
    listStart,
  );

  assert.ok(listStart >= 0);
  assert.ok(listEnd > listStart);

  const inventoryService = ownerSourceManagement.slice(listStart, listEnd);
  assert.match(inventoryService, /const customItems = customExperiments\\.map/);
  assert.match(inventoryService, /isCustom: true/);
  assert.match(inventoryService, /return customItems;/);
  assert.doesNotMatch(inventoryService, /builtInItems|publishedLabExperiments\\.map/);
  assert.match(ownerSourceInventory, /Only owner-created experiments appear here/);
  assert.doesNotMatch(ownerSourceInventory, /Create source on a built-in row/);
});

test("removing legacy rows from the inventory preserves their code-owned source and runtime assets", () => {
  const retainedSlugs = [
    "magnetic-interaction",
    "scroll-driven-text-reveal",
    "gradient-bloom",
    "generative-particle-field",
  ];

  for (const slug of retainedSlugs) {
    assert.match(legacyExperimentDefinitions, new RegExp('slug: "' + slug + '"'));
    assert.match(codeOwnedRuntimeRegistry, new RegExp('"' + slug + '"'));
  }

  assert.match(magneticInteractionRuntime, /MagneticButton/);
  assert.match(scrollDrivenTextRevealRuntime, /useScroll/);
  assert.match(scrollDrivenTextRevealRuntime, /useTransform/);
  assert.match(gradientBloomRuntime, /radial-gradient/);
  assert.match(generativeParticleFieldRuntime, /createParticles/);
  assert.match(magneticButtonSourceProject, /getMagneticButtonSourceProjectFiles/);
  assert.match(magneticButtonSourceProject, /runtime\\/experiments\\/magnetic-interaction\\/index\\.js/);
});

