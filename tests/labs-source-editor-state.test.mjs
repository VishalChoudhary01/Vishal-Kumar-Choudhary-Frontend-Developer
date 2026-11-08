import assert from "node:assert/strict";
import test from "node:test";

import { updateSourceFileContent } from "../src/app/lib/labs/source-editor-state.mjs";

const files = [
  { path: "src/App.jsx", language: "jsx", content: "export default function App() {}" },
  { path: "src/main.jsx", language: "jsx", content: "createRoot(root).render(<App />);" },
];

test("updates only the file addressed by its stable path", () => {
  const next = updateSourceFileContent(files, "src/App.jsx", "export default function App() { return null; }");

  assert.notEqual(next, files);
  assert.notEqual(next[0], files[0]);
  assert.equal(next[0].content, "export default function App() { return null; }");
  assert.equal(next[1], files[1]);
  assert.equal(files[0].content, "export default function App() {}");
});

test("keeps the same array when content or path does not change", () => {
  assert.equal(updateSourceFileContent(files, "src/App.jsx", files[0].content), files);
  assert.equal(updateSourceFileContent(files, "missing.js", "new content"), files);
});

test("does not update a different file when a selected tab changes during an edit", () => {
  const pathAtEditStart = "src/main.jsx";
  const next = updateSourceFileContent(files, pathAtEditStart, "const latestKeystroke = true;");

  assert.equal(next[0], files[0]);
  assert.equal(next[1].content, "const latestKeystroke = true;");
});

test("invalid input leaves a valid working-copy array unchanged", () => {
  assert.equal(updateSourceFileContent(files, null, "no path"), files);
  assert.equal(updateSourceFileContent(files, "src/App.jsx", null), files);
  assert.deepEqual(updateSourceFileContent(null, "src/App.jsx", "content"), []);
});
