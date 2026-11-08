import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceAccess = await readFile(
  new URL("../src/app/components/labs/detail/LabSourceAccess.js", import.meta.url),
  "utf8",
);

test("protected source content is rendered only inside the loaded authorized-source state", () => {
  const authorizedBranch = sourceAccess.indexOf('state === "loaded" && source ? (');
  const editor = sourceAccess.indexOf("<LabCodeEditor");

  assert.notEqual(authorizedBranch, -1);
  assert.notEqual(editor, -1);
  assert.ok(editor > authorizedBranch, "Monaco reader must stay inside the loaded-source branch");
  assert.match(sourceAccess, /readOnly\s*\n/);
  assert.match(sourceAccess, /keepCurrentModel=\{false\}/);
});

test("reader model identity is scoped to the experiment, published version and selected path", () => {
  assert.match(sourceAccess, /scope="reader"/);
  assert.match(sourceAccess, /experimentSlug=\{slug\}/);
  assert.match(sourceAccess, /versionId=\{String\(source\.version\)\}/);
  assert.match(sourceAccess, /filePath=\{selectedSourceFile\.path\}/);
  assert.match(sourceAccess, /language=\{selectedSourceFile\.language\}/);
});

test("copy uses exact authorized source content and retains the code_copy event", () => {
  assert.match(sourceAccess, /navigator\.clipboard\.writeText\(file\.content\)/);
  assert.match(sourceAccess, /eventType:\s*"code_copy"/);
  assert.match(sourceAccess, /sourceVersion:\s*source\.version/);
  assert.match(sourceAccess, /filePath:\s*file\.path/);
});

test("session invalidation clears source state so the read-only editor unmounts", () => {
  assert.match(sourceAccess, /sourceRef\.current = null;\s*setSource\(null\);/);
  assert.match(sourceAccess, /setState\("unauthenticated"\)/);
});

test("the old plain pre/code renderer is not left alongside Monaco", () => {
  assert.doesNotMatch(sourceAccess, /<pre[\s\S]*?<code>/);
});
