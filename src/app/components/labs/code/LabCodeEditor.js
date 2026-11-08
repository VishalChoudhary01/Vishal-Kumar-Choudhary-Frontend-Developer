"use client";

import { Component, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";

import {
  createLabEditorModelPath,
  createLabEditorOptions,
  resolveLabEditorLanguage,
} from "@/app/lib/labs/code-editor-config.mjs";

// Never use Monaco's default CDN. The build copies the pinned monaco-editor
// package to /public/monaco/vs and all editor/worker requests stay same-origin.
loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoSurface = dynamic(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-48 items-center justify-center bg-surface-1 px-4 text-xs text-text-tertiary" role="status" aria-live="polite">
        Loading code editor…
      </div>
    ),
  },
);

class MonacoErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function PlainTextFallback({
  value,
  readOnly,
  onChange,
  error,
  ariaLabel,
}) {
  return (
    <div className="flex h-full min-h-48 flex-col bg-surface-1">
      <div className="border-b border-border-subtle px-3 py-2 text-[10px] text-text-tertiary" role="status">
        {error
          ? "Syntax editor unavailable. Plain-text mode is active."
          : "Plain-text mode"}
      </div>
      <textarea
        aria-label={ariaLabel}
        spellCheck={false}
        readOnly={readOnly}
        value={value}
        onChange={readOnly ? undefined : (event) => onChange?.(event.target.value)}
        className="min-h-48 flex-1 resize-y border-0 bg-transparent p-3 font-mono text-xs leading-6 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand read-only:cursor-text"
      />
    </div>
  );
}

function defineLabsThemes(monaco) {
  monaco.editor.defineTheme("labs-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "87918F", fontStyle: "italic" },
      { token: "keyword", foreground: "72C8C0" },
      { token: "string", foreground: "D7B78B" },
      { token: "number", foreground: "C9A6E8" },
      { token: "type", foreground: "8FC6E8" },
      { token: "function", foreground: "E4D49B" },
    ],
    colors: {
      "editor.background": "#101311",
      "editor.foreground": "#E7E9E4",
      "editorLineNumber.foreground": "#666F6B",
      "editorLineNumber.activeForeground": "#D6DDD8",
      "editorCursor.foreground": "#71C5BE",
      "editor.selectionBackground": "#285B57",
      "editor.inactiveSelectionBackground": "#203D3A",
      "editor.lineHighlightBackground": "#171D1A",
      "editorIndentGuide.background1": "#28312D",
      "editorIndentGuide.activeBackground1": "#53615B",
      "editorWidget.background": "#171D1A",
      "editorWidget.border": "#34413B",
      "input.background": "#101311",
      "focusBorder": "#67BDB7",
    },
  });

  monaco.editor.defineTheme("labs-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "68736E", fontStyle: "italic" },
      { token: "keyword", foreground: "176B68" },
      { token: "string", foreground: "8B5B22" },
      { token: "number", foreground: "7551A4" },
      { token: "type", foreground: "275F82" },
      { token: "function", foreground: "725D1C" },
    ],
    colors: {
      "editor.background": "#FBF9F5",
      "editor.foreground": "#1C1B19",
      "editorLineNumber.foreground": "#918B81",
      "editorLineNumber.activeForeground": "#36332E",
      "editorCursor.foreground": "#176B68",
      "editor.selectionBackground": "#C9E1DE",
      "editor.inactiveSelectionBackground": "#E0ECEA",
      "editor.lineHighlightBackground": "#F1ECE4",
      "editorIndentGuide.background1": "#E1DBD1",
      "editorIndentGuide.activeBackground1": "#A9B9B4",
      "editorWidget.background": "#FBF9F5",
      "editorWidget.border": "#D6CEC3",
      "input.background": "#F7F4EE",
      "focusBorder": "#176B68",
    },
  });
}

export default function LabCodeEditor({
  value = "",
  language = "text",
  readOnly = true,
  onChange,
  scope = "reader",
  experimentSlug = "experiment",
  versionId = "current",
  filePath = "index.txt",
  modelPath,
  theme = "labs-dark",
  wordWrap = "off",
  minimap = false,
  keepCurrentModel = true,
  className = "h-[420px]",
  ariaLabel = "Source code editor",
  onEditorReady,
  onEditorError,
}) {
  const [editorFailed, setEditorFailed] = useState(false);
  const [loaderReady, setLoaderReady] = useState(false);
  useEffect(() => {
    let active = true;

    // Initialize the AMD loader from the local public asset path before
    // mounting the editor. A failed request switches to the working textarea.
    loader.init()
      .then(() => {
        if (active) {
          setLoaderReady(true);
          setEditorFailed(false);
        }
      })
      .catch((error) => {
        if (active) {
          setEditorFailed(true);
          onEditorError?.(error);
        }
      });

    return () => {
      active = false;
    };
  }, [onEditorError]);

  const safeValue = typeof value === "string" ? value : "";
  const safeReadOnly = readOnly === true || typeof onChange !== "function";
  const monacoLanguage = resolveLabEditorLanguage(language);
  const stableModelPath = modelPath || createLabEditorModelPath({
    scope,
    experimentSlug,
    versionId,
    filePath,
  });
  const options = useMemo(
    () => createLabEditorOptions({ readOnly: safeReadOnly, wordWrap, minimap }),
    [safeReadOnly, wordWrap, minimap],
  );

  const fallback = (
    <PlainTextFallback
      value={safeValue}
      readOnly={safeReadOnly}
      onChange={onChange}
      error={editorFailed}
      ariaLabel={ariaLabel}
    />
  );

  if (!loaderReady) {
    return (
      <div className={["min-h-48 overflow-hidden border border-border bg-surface-1", className].join(" ")}>
        {editorFailed ? fallback : (
          <div className="flex h-full min-h-48 items-center justify-center bg-surface-1 px-4 text-xs text-text-tertiary" role="status" aria-live="polite">
            Loading code editor…
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={["min-h-48 overflow-hidden border border-border bg-surface-1", className].join(" ")}>
      <MonacoErrorBoundary
        key={stableModelPath}
        fallback={fallback}
        onError={(error) => {
          setEditorFailed(true);
          onEditorError?.(error);
        }}
      >
        <MonacoSurface
          height="100%"
          path={stableModelPath}
          language={monacoLanguage}
          value={safeValue}
          theme={theme === "labs-light" ? "labs-light" : "labs-dark"}
          beforeMount={defineLabsThemes}
          onMount={(editor, monaco) => {
            setEditorFailed(false);
            onEditorReady?.({ editor, monaco });
          }}
          onChange={safeReadOnly ? undefined : (nextValue) => onChange?.(nextValue ?? "")}
          saveViewState
          keepCurrentModel={keepCurrentModel}
          options={options}
        />
      </MonacoErrorBoundary>
    </div>
  );
}
