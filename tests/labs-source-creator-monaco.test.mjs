import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const editor = await readFile(
  new URL("../src/app/components/labs/admin/LabSourceEditor.js", import.meta.url),
  "utf8",
);
const runPreview = await readFile(
  new URL("../src/app/components/labs/admin/LabSourceLivePreview.js", import.meta.url),
  "utf8",
);

test("owner source creator uses editable shared Monaco instead of a textarea", () => {
  assert.match(editor, /<LabCodeEditor/);
  assert.match(editor, /readOnly=\{Boolean\(busy\)\}/);
  assert.match(editor, /onChange=\{\(nextValue\) => updateFileContent\(selectedFile\.path, nextValue\)\}/);
  assert.doesNotMatch(editor, /<textarea/);
});

test("Monaco edits update the existing files state by stable file path", () => {
  assert.match(editor, /function updateFileContent\(filePath, content\)/);
  assert.match(editor, /updateSourceFileContent\(current, filePath, content\)/);
  assert.match(editor, /filesRef\.current = safeFiles;/);
  assert.match(editor, /setFiles\(safeFiles\)/);
  assert.match(editor, /filePath=\{selectedFile\.path\}/);
  assert.match(editor, /versionId="working-copy"/);
  assert.match(editor, /scope="creator"/);
});

test("Save Draft captures the latest synchronous working-copy snapshot", () => {
  const saveStart = editor.indexOf("async function saveDraft()");
  const publishStart = editor.indexOf("async function publishDraft()", saveStart);
  const saveBlock = editor.slice(saveStart, publishStart);

  assert.match(saveBlock, /const filesToSave = filesRef\.current/);
  assert.match(saveBlock, /files:\s*filesToSave/);
  assert.match(saveBlock, /files:\s*filesToSave,/);
});

test("Build & Publish saves the exact working-copy snapshot before publishing its version id", () => {
  const publishStart = editor.indexOf("async function publishDraft()");
  const unpublishStart = editor.indexOf("async function unpublishSource()", publishStart);
  const publishBlock = editor.slice(publishStart, unpublishStart);

  assert.match(publishBlock, /const filesToPublish = filesRef\.current/);
  assert.match(publishBlock, /const isDirty = JSON\.stringify\(filesToPublish\)/);
  assert.match(publishBlock, /files:\s*filesToPublish/);
  assert.match(publishBlock, /versionId,/);
  assert.match(publishBlock, /savedDraft\.versionId/);
});

test("Run receives the latest working-copy snapshot, not only the last React render", () => {
  assert.match(editor, /getWorkingFiles=\{\(\) => filesRef\.current\}/);
  assert.match(runPreview, /getWorkingFiles/);
  assert.match(runPreview, /const workingFiles = typeof getWorkingFiles === "function" \? getWorkingFiles\(\) : files/);
  assert.match(runPreview, /files: runFiles\.map\(/);
});

test("the existing file-management and runtime components remain mounted", () => {
  assert.match(editor, /function addFile\(/);
  assert.match(editor, /async function importFile\(/);
  assert.match(editor, /function removeSelectedFile\(/);
  assert.match(editor, /function moveFile\(/);
  assert.match(editor, /async function saveDraft\(/);
  assert.match(editor, /async function publishDraft\(/);
  assert.match(editor, /async function restoreVersion\(/);
  assert.match(editor, /<LabSourceLivePreview/);
  assert.match(editor, /<LabMediaLibrary/);
});

test("there is one React files-state write path behind the synchronous mirror", () => {
  const directWrites = editor.match(/setFiles\(/g) || [];
  assert.equal(directWrites.length, 1);
  assert.match(editor, /function commitFiles\(/);
  assert.match(editor, /filesRef\.current/);
});


test("source editor and metadata controls lock while save, restore or publish is in flight", () => {
  assert.match(editor, /disabled=\{Boolean\(busy\)\}[\s\S]*?onChange=\{\(event\) => updateSelected\(\{ path:/);
  assert.match(editor, /disabled=\{Boolean\(busy\)\}[\s\S]*?onChange=\{\(event\) => updateSelected\(\{ language:/);
  assert.match(editor, /readOnly=\{Boolean\(busy\)\}/);
});
