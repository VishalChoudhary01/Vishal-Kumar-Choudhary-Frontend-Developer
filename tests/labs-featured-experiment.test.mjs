import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveFeaturedExperiment } from "../src/app/lib/labs/featured-experiment.mjs";

const routeSource = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const dataSource = await readFile(
  new URL("../src/app/data/labsExperiments.js", import.meta.url),
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
  assert.equal(resolveFeaturedExperiment([], "magnetic-interaction"), null);
  assert.equal(resolveFeaturedExperiment(null, "magnetic-interaction"), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "broken" }], "broken"), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "broken", title: " " }], "broken"), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "bad slug", title: "Bad" }], "bad slug"), null);
  assert.equal(resolveFeaturedExperiment([{ slug: "good", title: "Good" }], "../good"), null);
});

test("route resolves the spotlight from the same eligible initial set delivered to the collection", () => {
  assert.match(dataSource, /FEATURED_LAB_EXPERIMENT_SLUG/);
  assert.match(routeSource, /getPublishedCustomLabExperimentPage\\(/);
  assert.match(
    routeSource,
    /const experiments = \\[\\.\\.\\.publishedLabExperiments, \\.\\.\\.customPage\\.experiments\\];/,
  );
  assert.match(routeSource, /resolveFeaturedExperiment\\(\\s*experiments,/);
  assert.match(routeSource, /<FeaturedExperiment experiment=\\{featuredExperiment\\}/);
  assert.match(
    routeSource,
    /<LabsCollection\\s+builtInExperiments=\\{publishedLabExperiments\\}\\s+initialCustomPage=\\{customPage\\}/,
  );
  assert.doesNotMatch(routeSource, /featuredLabExperiment/);
});
test("spotlight is a media-only detail link and respects reduced motion", () => {
  assert.match(spotlightSource, /useReducedMotion/);
  assert.match(spotlightSource, /whileInView="visible"/);
  assert.match(spotlightSource, /LabExperimentPreview/);
  assert.match(spotlightSource, /href=\{href\}/);
  assert.doesNotMatch(spotlightSource, /LabRuntimeBoundary|LabWorkspace|iframe/i);
});

test("shared preview error callback advances through validated preview fallbacks", () => {
  assert.match(previewSource, /function markPreviewFailed\(src\)/);
  assert.match(previewSource, /onError=\{\(\) => markPreviewFailed\(activePreview\.src\)\}/);
  assert.doesNotMatch(previewSource, /setFailedSrc/);
});
