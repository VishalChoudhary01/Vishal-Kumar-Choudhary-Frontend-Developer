import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createLabEditorModelPath } from "../src/app/lib/labs/code-editor-config.mjs";

const editor = await readFile(
  new URL("../src/app/components/labs/admin/LabSourceEditor.js", import.meta.url),
  "utf8",
);
const sourceManagement = await readFile(
  new URL("../src/app/lib/labs/source-management.js", import.meta.url),
  "utf8",
);
const versionRoute = await readFile(
  new URL("../src/app/api/v1/admin/labs/sources/[slug]/versions/[versionId]/route.js", import.meta.url),
  "utf8",
);

test("historical source viewer uses the shared read-only Monaco component", () => {
  const modalStart = editor.indexOf("{previewVersion ? (");
  const restoreStart = editor.indexOf("restoreVersion(versionId, versionLabel)", modalStart);
  const modal = editor.slice(modalStart, restoreStart);

  assert.notEqual(modalStart, -1);
  assert.match(modal, /<LabCodeEditor/);
  assert.match(modal, /readOnly/);
  assert.doesNotMatch(modal, /onChange=/);
  assert.doesNotMatch(modal, /<pre[\s\S]*?<code>/);
});

test("historical editor model is isolated by history scope, experiment, immutable version and file path", () => {
  const modalStart = editor.indexOf("{previewVersion ? (");
  const restoreStart = editor.indexOf("restoreVersion(versionId, versionLabel)", modalStart);
  const modal = editor.slice(modalStart, restoreStart);

  assert.match(modal, /scope="history"/);
  assert.match(modal, /experimentSlug=\{source\.slug\}/);
  assert.match(modal, /versionId=\{previewVersion\.versionId\}/);
  assert.match(modal, /filePath=\{previewVersion\.files\[previewFileIndex\]\.path\}/);
  assert.match(modal, /keepCurrentModel=\{false\}/);

  const first = createLabEditorModelPath({
    scope: "history",
    experimentSlug: "spotlightdock",
    versionId: "immutable-v4",
    filePath: "src/App.jsx",
  });
  const otherVersion = createLabEditorModelPath({
    scope: "history",
    experimentSlug: "spotlightdock",
    versionId: "immutable-v5",
    filePath: "src/App.jsx",
  });
  const otherFile = createLabEditorModelPath({
    scope: "history",
    experimentSlug: "spotlightdock",
    versionId: "immutable-v4",
    filePath: "src/main.jsx",
  });

  assert.notEqual(first, otherVersion);
  assert.notEqual(first, otherFile);
});

test("historical file tabs select immutable files and display stored language/content", () => {
  const modalStart = editor.indexOf("{previewVersion ? (");
  const restoreStart = editor.indexOf("restoreVersion(versionId, versionLabel)", modalStart);
  const modal = editor.slice(modalStart, restoreStart);

  assert.match(modal, /previewVersion\.files\.map\(\(file, index\)/);
  assert.match(modal, /onClick=\{\(\) => setPreviewFileIndex\(index\)\}/);
  assert.match(modal, /aria-pressed=\{previewFileIndex === index\}/);
  assert.match(modal, /language=\{previewVersion\.files\[previewFileIndex\]\.language\}/);
  assert.match(modal, /value=\{previewVersion\.files\[previewFileIndex\]\.content\}/);
});

test("closing the version modal unmounts and disposes its Monaco model", () => {
  const modalStart = editor.indexOf("{previewVersion ? (");
  const modal = editor.slice(modalStart);
  assert.match(modal, /onClick=\{\(\) => setPreviewVersion\(null\)\}/);
  assert.match(modal, /keepCurrentModel=\{false\}/);
});

test("Restore still calls the existing restore flow and never edits the historical version", () => {
  const modalStart = editor.indexOf("{previewVersion ? (");
  const modal = editor.slice(modalStart);
  assert.match(modal, /restoreVersion\(versionId, versionLabel\)/);
  assert.match(editor, /async function restoreVersion\(versionId, versionLabel\)/);
  assert.match(editor, /\/restore\/\" \+ encodeURIComponent\(versionId\)/);
  assert.match(editor, /basedOnVersionId:\s*oldVersion\.versionId/);
  assert.match(sourceManagement, /files:\s*oldVersion\.files/);
  assert.match(sourceManagement, /return result;/);
});

test("version API remains owner-authorized and returns immutable stored file snapshots", () => {
  assert.match(versionRoute, /getLabsOwnerUser\(\)/);
  assert.match(versionRoute, /getOwnerLabVersion\(\{ user, slug, versionId \}\)/);
  assert.match(sourceManagement, /export async function getOwnerLabVersion/);
  assert.match(sourceManagement, /version\.files/);
  assert.match(sourceManagement, /versionId:\s*version\.versionId/);
  assert.match(sourceManagement, /contentHash:\s*version\.contentHash/);
});
