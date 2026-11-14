import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createComponentCopyEventId } from "../src/app/lib/labs/component-copy-utils.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("copying the main entry file records one component copy even when other bundle files remain", () => {
  const eventId = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });

  assert.match(eventId, /^component_[a-f0-9]{64}$/);
});

test("copying remaining files does not create additional component-copy identities", () => {
  const afterMainFile = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });
  const afterSecondFile = createComponentCopyEventId({
    userId: "verified-user-1",
    experimentSlug: "example-component",
    sourceVersionId: "published-version-1",
  });

  assert.equal(afterMainFile, afterSecondFile);
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

test("the service only counts a component when the primary file path is copied", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  const recorder = service.slice(
    service.indexOf("export async function recordVerifiedSourceEvent"),
    service.indexOf("export async function getLabEngagementBatch"),
  );

  assert.match(recorder, /filePath === primaryFilePath/);
  assert.match(recorder, /typeof primaryFilePath === "string"/);
  assert.match(recorder, /const component = eventType === "code_copy"/);
  assert.match(recorder, /recordComponentCopyEvent/);
});

test("source event route determines the primary file from the trusted published snapshot", async () => {
  const route = await read("../src/app/api/v1/labs/[slug]/source/events/route.js");
  assert.match(route, /primaryFilePath = snapshot\.files\.find/);
  assert.match(route, /filePath,\s*primaryFilePath,\s*eventId/);
  assert.doesNotMatch(route, /body\.primaryFilePath/);
});

test("component copy identity is idempotent and independent of per-file event IDs", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  assert.match(service, /const eventId = createComponentCopyEventId/);
  assert.match(service, /eventType: "component_copy"/);
  assert.match(service, /\$setOnInsert/);
  assert.match(service, /eventId: safeEventId,[\s\S]*?eventType,[\s\S]*?filePath: filePath \|\| null/);
});

test("the primary file is the first copyable file in the exact published source version", async () => {
  const route = await read("../src/app/api/v1/labs/[slug]/source/events/route.js");
  assert.match(route, /source\.publishedVersionId/);
  assert.match(route, /LabSourceVersion\.findOne/);
  assert.match(route, /snapshot\.files\.find\(\s*\(file\) => typeof file\?\.content === "string"/);
});
