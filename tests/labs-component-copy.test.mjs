import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createComponentCopyEventId } from "../src/app/lib/labs/component-copy-utils.mjs";
import { getSourceEventRateLimit } from "../src/app/lib/labs/owner-analytics-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("any copied source file can trigger one component copy for a visitor and published version", () => {
  const eventId = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });

  assert.match(eventId, /^component_[a-f0-9]{64}$/);
});

test("component-copy identity stays the same across files copied from the same component version", () => {
  const indexHtmlCopy = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });
  const appJsxCopy = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });

  assert.equal(indexHtmlCopy, appJsxCopy);
});

test("different users, experiments, or published versions count as separate component copies", () => {
  const base = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });

  assert.notEqual(base, createComponentCopyEventId({
    userId: "verified-user-2",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  }));
  assert.notEqual(base, createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "another-component",
    sourceVersionId: "published-version-1",
  }));
  assert.notEqual(base, createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-2",
  }));
});

test("component-copy identity rejects invalid server-resolved identity values", () => {
  assert.throws(() => createComponentCopyEventId({
    userId: "",
    experimentSlug: "example-component",
    sourceVersionId: "version-1",
  }), { name: "TypeError" });
  assert.throws(() => createComponentCopyEventId({
    userId: "user-1",
    experimentSlug: "../bad",
    sourceVersionId: "version-1",
  }), { name: "TypeError" });
  assert.throws(() => createComponentCopyEventId({
    userId: "user-1",
    experimentSlug: "example-component",
    sourceVersionId: "",
  }), { name: "TypeError" });
});

test("every accepted code-copy action records a file event and attempts the one-per-version component event", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  const recorder = service.slice(
    service.indexOf("export async function recordVerifiedSourceEvent"),
    service.indexOf("export async function getLabEngagementBatch"),
  );

  assert.match(recorder, /eventType: \"code_copy\"|eventType,/);
  assert.match(recorder, /eventId: safeEventId/);
  assert.match(recorder, /eventType === "code_copy"\s*\? await recordComponentCopyEvent/);
  assert.doesNotMatch(recorder, /primaryFilePath/);
});

test("like and source event index setup only touches imported engagement models", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  const initializer = service.slice(
    service.indexOf("async function ensureEngagementIndexes"),
    service.indexOf("let excludedOwnerUserIdPromise"),
  );

  assert.match(initializer, /LabLike\.createIndexes\(\)/);
  assert.match(initializer, /LabGuestLike\.createIndexes\(\)/);
  assert.match(initializer, /LabAnalyticsEvent\.createIndexes\(\)/);
  assert.doesNotMatch(initializer, /LabComponentCopyProgress/);
});

test("each click creates a fresh event ID even when the same file is copied repeatedly", async () => {
  const sourceAccess = await read("../src/app/components/labs/detail/LabSourceAccess.js");
  const copyHandler = sourceAccess.slice(
    sourceAccess.indexOf("const copyCurrentFile"),
    sourceAccess.indexOf("\n  return (", sourceAccess.indexOf("const copyCurrentFile")),
  );

  assert.match(copyHandler, /navigator\.clipboard\.writeText\(file\.content\)/);
  assert.match(copyHandler, /eventType: "code_copy"/);
  assert.match(copyHandler, /crypto\?\.randomUUID\?\.\(\)/);
  assert.match(copyHandler, /await fetch\(/);
  assert.match(copyHandler, /response\.ok/);
});

test("repeated manual copy actions have a practical anti-abuse ceiling", () => {
  assert.equal(getSourceEventRateLimit("code_copy"), 60);
});

test("the event API validates each selected file against the exact published snapshot", async () => {
  const route = await read("../src/app/api/v1/labs/[slug]/source/events/route.js");
  assert.match(route, /snapshot\.files\.some/);
  assert.match(route, /filePath,\s*eventId/);
  assert.doesNotMatch(route, /primaryFilePath/);
});
