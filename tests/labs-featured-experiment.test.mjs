import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveFeaturedExperiment } from "../src/app/lib/labs/featured-experiment.mjs";

const routeSource = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const spotlightSource = await readFile(
  new URL("../src/app/components/labs/FeaturedExperiment.js", import.meta.url),
  "utf8",
);
const previewSource = await readFile(
  new URL("../src/app/components/labs/LabExperimentPreview.js", import.meta.url),
  "utf8",
);

test("featured experiment resolves the preferred slug from the eligible published collection", () => {
  const featured = {
    slug: "magnetic-interaction",
    title: "Magnetic Interaction",
    category: "Interface Interactions",
  };
  const collection = [
    { slug: "gradient-bloom", title: "Gradient Bloom" },
    featured,
  ];

  assert.equal(
    resolveFeaturedExperiment(collection, "magnetic-interaction"),
    featured,
  );
});

test("unavailable preferred slug falls back to the first real eligible experiment", () => {
  const first = { slug: "gradient-bloom", title: "Gradient Bloom" };
  const second = { slug: "particle-field", title: "Particle Field" };

  assert.equal(resolveFeaturedExperiment([null, {}, first, second], "missing"), first);
});

test("empty, malformed and invalid collections cannot create a featured placeholder", () => {
  assert.equal(resolveFeaturedExperiment([]), null);
  assert.equal(resolveFeaturedExperiment(null), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "broken" }]), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "broken", title: " " }]), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "bad slug", title: "Bad" }]), null);
});

test("an omitted or invalid preferred slug falls back to the first eligible source record", () => {
  const first = { slug: "fluid-gradient-playground", title: "Fluid Gradient Playground" };
  const second = { slug: "spotlightdock", title: "SpotlightDock" };

  assert.equal(resolveFeaturedExperiment([null, {}, first, second]), first);
  assert.equal(resolveFeaturedExperiment([first, second], "../external"), first);
});
test("route resolves the spotlight only from the eligible source-backed page delivered to the collection", () => {
  assert.ok(routeSource.includes("getPublishedCustomLabExperimentPage("));
  assert.ok(routeSource.includes("const experiments = customPage.experiments;"));
  assert.ok(routeSource.includes("resolveFeaturedExperiment(experiments)"));
  assert.ok(routeSource.includes("<FeaturedExperiment experiment={featuredExperiment}"));
  assert.ok(routeSource.includes("initialCustomPage={customPage}"));
  assert.ok(!routeSource.includes("publishedLabExperiments"));
  assert.ok(!routeSource.includes("builtInExperiments"));
});
test("spotlight is a media-only detail link and respects reduced motion", () => {
  assert.match(spotlightSource, /useReducedMotion/);
  assert.match(spotlightSource, /whileInView="visible"/);
  assert.match(spotlightSource, /LabExperimentPreview/);
  assert.ok(spotlightSource.includes('surface="brand"'));
  assert.match(spotlightSource, /href=\{href\}/);
  assert.doesNotMatch(spotlightSource, /LabRuntimeBoundary|LabWorkspace|iframe/i);
});

test("shared preview error callback advances through validated preview fallbacks", () => {
  assert.match(previewSource, /function markPreviewFailed\(src\)/);
  assert.match(previewSource, /onError=\{\(\) => markPreviewFailed\(activePreview\.src\)\}/);
  assert.doesNotMatch(previewSource, /setFailedSrc/);
});

test("featured experiment typography and preview layout adapt across breakpoints", () => {
  assert.ok(spotlightSource.includes("grid-cols-1 items-center gap-7 sm:gap-9"));
  assert.ok(spotlightSource.includes("lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]"));
  assert.ok(spotlightSource.includes("text-[clamp(2.1rem,7vw,2.9rem)]"));
  assert.ok(spotlightSource.includes("sm:text-[clamp(2.7rem,5.2vw,5.25rem)]"));
  assert.ok(spotlightSource.includes("text-[13px] leading-6"));
});


test("featured experiment action matches the compact Labs hero button on mobile", async () => {
  const [buttonSource, introSource] = await Promise.all([
    readFile(new URL("../src/app/components/common/ProjectResumeButton.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url), "utf8"),
  ]);

  assert.ok(spotlightSource.includes('size="sm"'));
  assert.ok(spotlightSource.includes('className="mt-6 sm:mt-9"'));
  assert.ok(introSource.includes('size="sm"'));
  assert.ok(buttonSource.includes('xs: {'));
  assert.ok(buttonSource.includes("min-w-[104px]"));
  assert.ok(buttonSource.includes("size-7 sm:size-9 lg:size-10"));
});

test("experiment detail sections use consistent compact mobile gutters and source actions stay inline", async () => {
  const [header, workspace, explanation, sourceAccess, detailPage, buttonSource] = await Promise.all([
    readFile(new URL("../src/app/components/labs/detail/LabDetailHeader.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/labs/detail/LabWorkspace.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/labs/detail/LabExplanation.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/labs/detail/LabSourceAccess.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/labs/[slug]/page.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/components/common/ProjectResumeButton.js", import.meta.url), "utf8"),
  ]);

  for (const source of [header, workspace, explanation, sourceAccess, detailPage]) {
    assert.ok(source.includes("px-4"), "Detail section is missing the compact mobile gutter");
  }
  assert.ok(explanation.includes("mt-8"));
  assert.ok(sourceAccess.includes("p-3 sm:p-6"));
  assert.ok(sourceAccess.includes('size="xs"'));
  assert.ok(sourceAccess.includes("gap-2 sm:mt-4 sm:gap-3"));
  assert.ok(buttonSource.includes("sm:min-w-[150px]"));
  assert.ok(buttonSource.includes("lg:min-w-[160px]"));
});
