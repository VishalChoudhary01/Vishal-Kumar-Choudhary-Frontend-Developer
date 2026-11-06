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
const artworkSource = await readFile(
  new URL("../src/app/components/labs/landing/LabArtwork.js", import.meta.url),
  "utf8",
);
const loadMoreSource = await readFile(
  new URL("../src/app/hooks/labs/useLabLoadMore.js", import.meta.url),
  "utf8",
);
const filterHookSource = await readFile(
  new URL("../src/app/hooks/labs/useLabCategoryFilter.js", import.meta.url),
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
  assert.match(collectionSource, /<LabLikeButton/);
  assert.match(collectionSource, /initialData=\{engagement\}/);
  assert.match(collectionSource, /useLabLoadMore/);
  assert.match(collectionSource, /Load \{nextPageCount\} more experiments/);
});

test("collection uses reduced-motion-aware in-view reveals for cards", () => {
  assert.match(collectionSource, /useReducedMotion/);
  assert.match(collectionSource, /whileInView=\{\{ opacity: 1, y: 0 \}\}/);
  assert.match(collectionSource, /viewport=\{\{ once: true/);
  assert.match(collectionSource, /reducedMotion/);
});

test("category filters are computed from the current published collection", () => {
  assert.match(filterHookSource, /buildLabCategoryOptions\(experiments, LAB_CATEGORIES\)/);
  assert.match(filterHookSource, /experiments\.filter/);
});

test("card artwork uses container-query sizing to prevent title clipping", () => {
  assert.match(artworkSource, /@container/);
  assert.match(artworkSource, /cqw/);
  assert.match(artworkSource, /max-w-\[18ch\]/);
  assert.match(artworkSource, /max-w-\[15ch\]/);
});

test("progressive loading remains bounded to six items per action", () => {
  assert.match(loadMoreSource, /const PAGE_SIZE = 6/);
  assert.match(loadMoreSource, /nextPageCount/);
});
