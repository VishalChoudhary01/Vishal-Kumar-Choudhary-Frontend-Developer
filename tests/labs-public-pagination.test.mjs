import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPublicExperimentCursorMatch,
  decodePublicExperimentCursor,
  encodePublicExperimentCursor,
} from "../src/app/lib/labs/public-experiment-cursor.mjs";

const listingSource = await readFile(
  new URL("../src/app/lib/labs/public-experiments.js", import.meta.url),
  "utf8",
);
const routeSource = await readFile(
  new URL("../src/app/api/v1/labs/route.js", import.meta.url),
  "utf8",
);
const pageSource = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const collectionHookSource = await readFile(
  new URL("../src/app/hooks/labs/useLabPublicCollection.js", import.meta.url),
  "utf8",
);
const modelSource = await readFile(
  new URL("../src/app/lib/labs/models/LabExperiment.js", import.meta.url),
  "utf8",
);

const objectId = "65f0c4a5b2d8a12f3e7a910c";

test("publication cursor encodes and decodes the stable publishedAt/id tuple", () => {
  const publishedAt = new Date("2026-11-07T12:30:00.000Z");
  const cursor = encodePublicExperimentCursor({ publishedAt, id: objectId });

  assert.deepEqual(decodePublicExperimentCursor(cursor), {
    publishedAt,
    id: objectId,
  });
});

test("null publication dates round-trip and stay at the end of descending order", () => {
  const cursor = encodePublicExperimentCursor({ publishedAt: null, id: objectId });
  const decoded = decodePublicExperimentCursor(cursor);

  assert.equal(decoded.publishedAt, null);
  assert.equal(decoded.id, objectId);

  const match = buildPublicExperimentCursorMatch(decoded, (value) => ({ objectId: value }));
  assert.deepEqual(match, {
    publishedAt: null,
    _id: { $lt: { objectId } },
  });
});

test("cursor predicate uses the stable descending publication date and id tie-breaker", () => {
  const publishedAt = new Date("2026-11-07T12:30:00.000Z");
  const decoded = { publishedAt, id: objectId };
  const match = buildPublicExperimentCursorMatch(decoded, (value) => ({ objectId: value }));

  assert.deepEqual(match, {
    $or: [
      { publishedAt: { $lt: publishedAt } },
      { publishedAt, _id: { $lt: { objectId } } },
    ],
  });
});

test("malformed, empty, oversized and non-object-id cursors are rejected", () => {
  for (const invalid of [
    "",
    "not-a-cursor",
    "A".repeat(400),
    Buffer.from(JSON.stringify({ p: null, id: "not-an-object-id" })).toString("base64url"),
    Buffer.from(JSON.stringify({ p: "not-a-date", id: objectId })).toString("base64url"),
  ]) {
    assert.throws(() => decodePublicExperimentCursor(invalid), TypeError);
  }
});

test("public listing joins current published source to the exact ready artifact version before limiting", () => {
  assert.match(listingSource, /published: true/);
  assert.match(listingSource, /publishedVersionId/);
  assert.match(listingSource, /publishedArtifactId/);
  assert.match(listingSource, /status: "ready"/);
  assert.match(listingSource, /readyArtifact\.sourceVersionId/);
  assert.match(listingSource, /publishedSource\.publishedVersionId/);
  assert.match(listingSource, /\{ \$limit: pageSize \+ 1 \}/);
  assert.match(listingSource, /\{ \$sort: \{ publishedAt: -1, _id: -1 \} \}/);
});

test("cursor matching is applied before source/artifact lookup stages", () => {
  const cursorMatchIndex = listingSource.indexOf("...(cursorMatch ? [{ $match: cursorMatch }] : [])");
  const sourceLookupIndex = listingSource.indexOf('from: LabSource.collection.name');
  assert.ok(cursorMatchIndex >= 0);
  assert.ok(sourceLookupIndex > cursorMatchIndex);
});

test("listing endpoint fixes the server page size and validates categories and cursors", () => {
  assert.match(routeSource, /const PAGE_SIZE = 18/);
  assert.match(routeSource, /LAB_CATEGORIES\.some/);
  assert.match(routeSource, /decodePublicExperimentCursor\(cursor\)/);
  assert.match(routeSource, /params\.has\("limit"\)/);
  assert.match(routeSource, /getPublishedCustomLabExperimentPage/);
});

test("initial Labs route loads one bounded custom page and complete eligible counts", () => {
  assert.match(pageSource, /getPublishedCustomLabExperimentPage\(\s*\{/);
  assert.match(pageSource, /limit: 18/);
  assert.match(pageSource, /includeCategoryCounts: true/);
  assert.doesNotMatch(pageSource, /getPublishedCustomLabExperiments/);
  assert.match(pageSource, /customPage\.totalCount/);
  assert.match(pageSource, /customPage\.categoryCounts/);
});

test("client reveals six at a time and requests subsequent cursor pages on demand", () => {
  assert.match(collectionHookSource, /const REVEAL_BATCH_SIZE = 6/);
  assert.match(collectionHookSource, /pageCache/);
  assert.match(collectionHookSource, /nextCursor/);
  assert.match(collectionHookSource, /requestPublicPage\(/);
  assert.match(collectionHookSource, /category: requestedCategory/);
  assert.match(collectionHookSource, /cursor,/);
  assert.match(collectionHookSource, /AbortController/);
});

test("Mongo indexes align with the stable cursor sort and category filter", () => {
  assert.match(modelSource, /lab_experiments_publication_cursor/);
  assert.match(modelSource, /kind: 1, status: 1, publishedAt: -1, _id: -1/);
  assert.match(modelSource, /lab_experiments_category_publication_cursor/);
  assert.match(modelSource, /category: 1, publishedAt: -1, _id: -1/);
});
