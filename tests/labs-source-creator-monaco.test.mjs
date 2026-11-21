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
const workspace = await readFile(
  new URL("../src/app/components/labs/admin/LabResizableWorkspace.js", import.meta.url),
  "utf8",
);
const workspaceStyles = await readFile(
  new URL("../src/app/components/labs/admin/LabResizableWorkspace.module.css", import.meta.url),
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
const createForm = await readFile(
  new URL("../src/app/components/labs/admin/LabExperimentCreateForm.js", import.meta.url),
  "utf8",
);

test("creating an experiment navigates directly to the source editor for the created slug", () => {
  assert.match(createForm, /fetch\("\/api\/v1\/admin\/labs\/experiments"/);
  assert.match(createForm, /const createdSlug = payload\?\.data\?\.slug/);
  assert.match(createForm, /const expectedWorkspaceUrl =/);
  assert.match(createForm, /"\/admin\/labs\/sources\/" \+ encodeURIComponent\(createdSlug\)/);
  assert.match(createForm, /workspaceUrl !== expectedWorkspaceUrl/);
  assert.match(createForm, /router\.push\(workspaceUrl\)/);
  assert.doesNotMatch(createForm, /router\.refresh\(\)/);
  assert.match(createForm, /if \(busy\) return/);
});


 
test("React JS and TSX offer an optional shared Lenis provider starter", () => {
  assert.ok(editor.includes("function configureReactLenisStarter("));
  assert.ok(editor.includes("function createReactStarter({ withLenis = false } = {})"));
  assert.ok(editor.includes("function createReactTsStarter({ withLenis = false } = {})"));
  assert.ok(editor.includes("React JS + Lenis"));
  assert.ok(editor.includes("React TSX + Lenis"));
  assert.ok(editor.includes('import { ReactLenis } from "lenis/react"'));
  assert.ok(editor.includes('import { useLenis } from "lenis/react"'));
  assert.ok(editor.includes('import "lenis/dist/lenis.css"'));
  assert.ok(editor.includes("ReactLenis root options={{ autoRaf: true, anchors: true }}"));
  assert.ok(editor.includes('lenis?.scrollTo("#top")'));
  assert.ok(editor.includes("min-h-[70vh]"));
});


test("the source workspace keeps files, editor and preview as independent mounted panels", () => {
  assert.match(editor, /<LabResizableWorkspace[\s\S]*?files=\{[\s\S]*?editor=\{[\s\S]*?preview=\{/);
  assert.ok(workspace.includes('{files}</div>'));
  assert.ok(workspace.includes('{editor}</div>'));
  assert.ok(workspace.includes('{preview}</div>'));
  assert.match(workspace, /setPointerCapture/);
  assert.match(workspace, /onPointerMove=\{moveResize\}/);
  assert.match(workspace, /onKeyDown=\{\(event\) => resizeWithKeyboard/);
  assert.match(workspace, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(workspace, /Focus preview/);
  assert.match(workspace, /data-tablet-files-open/);
  assert.match(workspaceStyles, /grid-template-columns: var\(--files-track/);
  assert.match(workspaceStyles, /@media \(min-width: 768px\) and \(max-width: 1279px\)/);
  assert.match(workspaceStyles, /@media \(max-width: 767px\)/);
  assert.match(workspaceStyles, /data-preview-visible="false"\]\[data-files-visible="false"/);
  assert.match(workspaceStyles, /mobileTabs/);
  assert.match(editor, /function addFile\(/);
  assert.match(editor, /async function importFile\(/);
  assert.match(editor, /function moveFile\(/);
  assert.match(editor, /async function saveDraft\(/);
  assert.match(editor, /async function publishDraft\(/);
  assert.match(editor, /async function restoreVersion\(/);
  assert.match(editor, /<LabMediaLibrary/);
});

test("expanded preview keeps the same isolated iframe and locks page scrolling", () => {
  assert.match(runPreview, /const \[isExpanded, setIsExpanded\] = useState\(false\)/);
  assert.match(runPreview, /document\.body\.style\.overflow = "hidden"/);
  assert.match(runPreview, /event\.key === "Escape"/);
  assert.match(runPreview, /key=\{run\.runId\}/);
  assert.equal((runPreview.match(/<iframe/g) || []).length, 1);
  assert.match(runPreview, /aria-expanded=\{isExpanded\}/);
  assert.match(runPreview, /setConsoleExpanded/);
  assert.match(runPreview, /h-full min-h-0 rounded-\[2px\] border border-border bg-white/);
  assert.match(runPreview, /getWorkingFiles/);
});
