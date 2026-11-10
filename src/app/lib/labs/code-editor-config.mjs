const LANGUAGE_MAP = Object.freeze({
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
});

const EDITOR_LANGUAGES = new Set(Object.keys(LANGUAGE_MAP));

export function resolveLabEditorLanguage(language) {
  const normalized = typeof language === "string" ? language.trim().toLowerCase() : "";
  return LANGUAGE_MAP[normalized] || "plaintext";
}

export function createLabEditorModelPath({
  scope = "reader",
  experimentSlug = "experiment",
  filePath = "index.txt",
  versionId = "current",
} = {}) {
  const safeSegment = (value, fallback) => {
    const text = typeof value === "string" && value.trim() ? value.trim() : fallback;
    return encodeURIComponent(text.replaceAll("\\", "/"));
  };

  const fileSegments = String(filePath || "index.txt")
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  return [
    "inmemory://labs",
    safeSegment(scope, "reader"),
    safeSegment(experimentSlug, "experiment"),
    safeSegment(versionId, "current"),
    ...(fileSegments.length ? fileSegments : ["index.txt"]),
  ].join("/");
}

export function createLabEditorOptions({
  readOnly = true,
  wordWrap = "off",
  minimap = false,
  tabSize = 2,
} = {}) {
  const editable = readOnly !== true;

  return {
    readOnly: !editable,
    domReadOnly: !editable,
    lineNumbers: "on",
    glyphMargin: false,
    folding: true,
    showFoldingControls: "mouseover",
    minimap: { enabled: minimap === true },
    wordWrap: wordWrap === "on" ? "on" : "off",
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    /*
     * Monaco otherwise consumes wheel input even at its scroll boundaries,
     * preventing the outer owner workspace from continuing to scroll.
     */
    alwaysConsumeMouseWheel: false,
    cursorSmoothCaretAnimation: "on",
    automaticLayout: true,
    fontFamily: "var(--font-azeret-mono), ui-monospace, SFMono-Regular, monospace",
    fontSize: 13,
    lineHeight: 22,
    tabSize: Number.isInteger(tabSize) && tabSize >= 1 && tabSize <= 8 ? tabSize : 2,
    insertSpaces: true,
    detectIndentation: false,
    renderWhitespace: "selection",
    bracketPairColorization: { enabled: true },
    guides: { indentation: true, bracketPairs: true },
    stickyScroll: { enabled: false },
    contextmenu: true,
    links: false,
    mouseWheelZoom: false,
    accessibilitySupport: "auto",
    readOnlyMessage: { value: "This source file is read-only." },
    quickSuggestions: editable,
    suggestOnTriggerCharacters: editable,
    acceptSuggestionOnEnter: editable ? "on" : "off",
    parameterHints: { enabled: editable },
    hover: { enabled: true, delay: 350 },
    padding: { top: 12, bottom: 12 },
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  };
}

export function isSupportedLabEditorLanguage(language) {
  return typeof language === "string" && EDITOR_LANGUAGES.has(language.trim().toLowerCase());
}
