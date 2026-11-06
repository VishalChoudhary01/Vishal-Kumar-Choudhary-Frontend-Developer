import assert from "node:assert/strict";
import test from "node:test";

import {
  createLabEditorModelPath,
  createLabEditorOptions,
  isSupportedLabEditorLanguage,
  resolveLabEditorLanguage,
} from "../src/app/lib/labs/code-editor-config.mjs";

test("maps every existing Labs source language to the correct Monaco language", () => {
  const languages = {
    javascript: "javascript",
    jsx: "javascript",
    typescript: "typescript",
    tsx: "typescript",
    css: "css",
    html: "html",
    json: "json",
    markdown: "markdown",
    text: "plaintext",
    svg: "xml",
  };

  for (const [sourceLanguage, monacoLanguage] of Object.entries(languages)) {
    assert.equal(resolveLabEditorLanguage(sourceLanguage), monacoLanguage);
    assert.equal(isSupportedLabEditorLanguage(sourceLanguage), true);
  }
});

test("unknown or absent language falls back to plaintext without changing source validation", () => {
  assert.equal(resolveLabEditorLanguage("unknown"), "plaintext");
  assert.equal(resolveLabEditorLanguage(null), "plaintext");
  assert.equal(isSupportedLabEditorLanguage("unknown"), false);
});

test("model URI is stable by experiment, mode, version and file path", () => {
  const base = {
    scope: "creator",
    experimentSlug: "spotlightdock",
    versionId: "version-2",
    filePath: "src/components/SpotlightDock.tsx",
  };

  const first = createLabEditorModelPath(base);
  assert.equal(first, createLabEditorModelPath(base));
  assert.notEqual(first, createLabEditorModelPath({ ...base, filePath: "src/App.tsx" }));
  assert.notEqual(first, createLabEditorModelPath({ ...base, versionId: "version-3" }));
  assert.notEqual(first, createLabEditorModelPath({ ...base, scope: "history" }));
  assert.match(first, /^inmemory:\/\/labs\//);
});

test("model URI safely encodes file path segments", () => {
  const uri = createLabEditorModelPath({
    scope: "reader",
    experimentSlug: "spotlightdock",
    versionId: "v2",
    filePath: "folder with spaces/App #1.jsx",
  });

  assert.match(uri, /folder%20with%20spaces/);
  assert.match(uri, /App%20%231\.jsx/);
  assert.equal(uri.includes(" "), false);
});

test("read-only defaults cannot be accidentally made editable", () => {
  const options = createLabEditorOptions();
  assert.equal(options.readOnly, true);
  assert.equal(options.domReadOnly, true);
  assert.equal(options.quickSuggestions, false);
  assert.equal(options.suggestOnTriggerCharacters, false);
  assert.equal(options.acceptSuggestionOnEnter, "off");
});

test("editable mode enables suggestions without changing core layout defaults", () => {
  const options = createLabEditorOptions({ readOnly: false, wordWrap: "on", minimap: true });
  assert.equal(options.readOnly, false);
  assert.equal(options.domReadOnly, false);
  assert.equal(options.quickSuggestions, true);
  assert.equal(options.suggestOnTriggerCharacters, true);
  assert.equal(options.acceptSuggestionOnEnter, "on");
  assert.equal(options.wordWrap, "on");
  assert.equal(options.minimap.enabled, true);
  assert.equal(options.tabSize, 2);
  assert.equal(options.lineNumbers, "on");
  assert.equal(options.fontSize, 13);
});
