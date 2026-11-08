import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildLabCategoryOptions } from "../src/app/lib/labs/category-options.mjs";

const categories = [
  { id: "motion-animation", name: "Motion & Animation", label: "Motion" },
  { id: "css-experiments", name: "CSS Experiments", label: "CSS" },
  { id: "interface-interactions", name: "Interface Interactions", label: "Interactions" },
  { id: "creative-coding", name: "Creative Coding", label: "Creative Coding" },
];

const collectionSource = await readFile(
  new URL("../src/app/components/labs/LabsCollection.js", import.meta.url),
  "utf8",
);
const previewSource = await readFile(
  new URL("../src/app/components/labs/LabExperimentPreview.js", import.meta.url),
  "utf8",
);
const loadMoreSource = await readFile(
  new URL("../src/app/hooks/labs/useLabPublicCollection.js", import.meta.url),
  "utf8",
);
const filterHookSource = await readFile(
  new URL("../src/app/hooks/labs/useLabCategoryFilter.js", import.meta.url),
  "utf8",
);
const likeButtonSource = await readFile(
  new URL("../src/app/components/labs/LabLikeButton.js", import.meta.url),
  "utf8",
);
const shellSource = await readFile(
  new URL("../src/app/components/labs/LabsPageShell.js", import.meta.url),
  "utf8",
);
const navbarSource = await readFile(
  new URL("../src/app/components/layout/Navbar.js", import.meta.url),
  "utf8",
);

test("category options include only categories represented by published entries", () => {
  const options = buildLabCategoryOptions(
    [
      { slug: "magnetic-interaction", category: "Interface Interactions" },
      { slug: "scroll-reveal", category: "Motion & Animation" },
      { slug: "gradient-bloom", category: "CSS Experiments" },
      { slug: "another-motion-study", category: "Motion & Animation" },
    ],
    categories,
  );

  assert.deepEqual(options, [
    { id: "all", label: "All", count: 4 },
    { ...categories[0], count: 2 },
    { ...categories[1], count: 1 },
    { ...categories[2], count: 1 },
  ]);
});

test("all count is based on the actual input and empty categories stay hidden", () => {
  assert.deepEqual(buildLabCategoryOptions([], categories), [
    { id: "all", label: "All", count: 0 },
  ]);
});

test("invalid category values do not create fake filters or counts", () => {
  const options = buildLabCategoryOptions(
    [
      { slug: "valid", category: "Creative Coding" },
      { slug: "missing" },
      { slug: "blank", category: " " },
      null,
    ],
    categories,
  );

  assert.deepEqual(options, [
    { id: "all", label: "All", count: 4 },
    { ...categories[3], count: 1 },
  ]);
});

test("collection keeps existing real-data links, likes and progressive loading", () => {
  assert.match(collectionSource, /key=\{experiment\.slug\}/);
  assert.ok(collectionSource.includes("href={`/labs/${experiment.slug}`}"));
  assert.ok(!collectionSource.includes("builtInExperiments"));
  assert.match(collectionSource, /<LabLikeButton/);
  assert.match(collectionSource, /initialData=\{engagement\}/);
  assert.match(collectionSource, /useLabPublicCollection/);
  assert.match(collectionSource, /nextPageCount > 0/);
});

test("collection uses reduced-motion-aware in-view reveals for cards", () => {
  assert.match(collectionSource, /useReducedMotion/);
  assert.match(collectionSource, /whileInView=\{\{ opacity: 1, y: 0 \}\}/);
  assert.match(collectionSource, /viewport=\{\{ once: true/);
  assert.match(collectionSource, /reducedMotion/);
});

test("category filters combine local entries with the complete server category summary", () => {
  assert.ok(
    filterHookSource.includes(
      "buildLabCategoryOptions(experiments, LAB_CATEGORIES, summary)",
    ),
  );
  assert.ok(filterHookSource.includes("[experiments, summary]"));
  assert.ok(filterHookSource.includes("experiments.filter"));
});
test("public preview uses only source-promoted media and no code-owned artwork fallback", () => {
  assert.match(previewSource, /galleryPreview/);
  assert.match(previewSource, /generatedPoster/);
  assert.match(previewSource, /selectActiveGalleryPreview/);
  assert.match(previewSource, /Preview media unavailable/);
  assert.doesNotMatch(previewSource, /LabArtwork|MagneticArtwork|GradientBloomArtwork|GenerativeParticleArtwork/);
});
test("progressive loading remains bounded to six items per action", () => {
  assert.match(loadMoreSource, /const REVEAL_BATCH_SIZE = 6/);
  assert.match(loadMoreSource, /nextPageCount/);
  assert.match(loadMoreSource, /requestPublicPage/);
});

test("server collection summary prevents the current page from understating global counts", () => {
  const options = buildLabCategoryOptions(
    [{ slug: "magnetic-interaction", category: "Interface Interactions" }],
    categories,
    {
      totalCount: 31,
      categoryCounts: {
        "Interface Interactions": 12,
        "Creative Coding": 4,
      },
    },
  );

  assert.deepEqual(options, [
    { id: "all", label: "All", count: 31 },
    { ...categories[2], count: 12 },
    { ...categories[3], count: 4 },
  ]);
});

test("experiment like action sits beside the title without a separate footer row", () => {
  assert.ok(collectionSource.includes("aria-labelledby={titleId}"));
  assert.ok(collectionSource.includes("id={titleId}"));
  assert.ok(collectionSource.includes('role="group"'));
  assert.ok(collectionSource.includes("aria-label={`Actions for ${experiment.title}`}"));
  assert.ok(collectionSource.includes('className="flex min-w-0 items-start justify-between gap-3"'));
  assert.equal(collectionSource.split("href={`/labs/${experiment.slug}`}").length - 1, 2);
  assert.ok(collectionSource.indexOf('role="group"') < collectionSource.indexOf("<LabLikeButton"));
  assert.ok(collectionSource.indexOf('role="group"') < collectionSource.indexOf("{experiment.description ?"));
  assert.ok(!collectionSource.includes('Experiment / {String(index + 1).padStart(2, "0")}'));
  assert.ok(!collectionSource.includes("border-t border-border-subtle pt-3"));
  assert.ok(!collectionSource.includes("border-b border-border-subtle pb-5"));
  assert.ok(collectionSource.includes("experimentTitle={experiment.title}"));
  assert.ok(likeButtonSource.includes("aria-label={data?.liked ? `Unlike ${experimentTitle}` : `Like ${experimentTitle}`}"));
  assert.ok(likeButtonSource.includes('compact ? "h-11 min-w-[5.5rem] px-3 sm:h-9 sm:min-w-0 sm:px-2.5"'));
});

test("collection cards use one column on mobile, two on tablet and three on wide desktop", () => {
  assert.ok(collectionSource.includes("grid-cols-1 items-stretch gap-x-5"));
  assert.ok(collectionSource.includes("sm:grid-cols-2"));
  assert.ok(collectionSource.includes("xl:grid-cols-3"));
  assert.ok(collectionSource.includes("(max-width: 1279px) 50vw"));
  assert.ok(collectionSource.includes("text-[clamp(2.15rem,7vw,2.6rem)]"));
});

test("the Labs-only navbar uses a solid scrolled surface without changing the default navbar", () => {
  assert.ok(shellSource.includes("solidScrolledSurface"));
  assert.ok(navbarSource.includes('solidScrolledSurface ? "bg-surface-elevated/95"'));
  assert.ok(navbarSource.includes('solidScrolledSurface ? "lg:bg-surface-elevated/95"'));
});
