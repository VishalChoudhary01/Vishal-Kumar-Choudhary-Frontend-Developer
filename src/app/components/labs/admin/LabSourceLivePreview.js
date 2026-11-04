"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Monitor, Play, RefreshCw, Smartphone, Terminal } from "lucide-react";

const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "worker-src 'none'",
].join("; ");

function extension(path) {
  return String(path || "").split(".").pop()?.toLowerCase() || "";
}

function escapeStyle(value) {
  return String(value).replace(/<\/style/gi, "<\\/style");
}

function escapeScript(value) {
  return String(value).replace(/<\/script/gi, "<\\/script");
}

function buildDocument(files) {
  const htmlFile = files.find((file) => ["html", "htm"].includes(extension(file.path)));
  const styles = files
    .filter((file) => extension(file.path) === "css")
    .map((file) => file.content || "")
    .join("\n\n");
  const scripts = files
    .filter((file) => ["js", "mjs"].includes(extension(file.path)))
    .map((file) => file.content || "");

  const bridge = "<script>(() => {" +
    "const send = (level, values) => { try {" +
    "const message = values.map((value) => { if (typeof value === 'string') return value; try { return JSON.stringify(value); } catch { return String(value); } }).join(' ').slice(0, 1800);" +
    "window.parent.postMessage({ type: 'labs-preview-console', level, message }, '*');" +
    "} catch {} };" +
    "['log', 'info', 'warn', 'error'].forEach((level) => { const original = console[level].bind(console); console[level] = (...values) => { original(...values); send(level, values); }; });" +
    "window.addEventListener('error', (event) => send('error', [event.message || 'Runtime error']));" +
    "window.addEventListener('unhandledrejection', (event) => send('error', ['Unhandled promise rejection', event.reason]));" +
    "})();</script>";

  const styleTag = styles ? "<style>" + escapeStyle(styles) + "</style>" : "";
  const scriptTags = scripts
    .map((script) => '<script type="module">' + escapeScript(script) + "</script>")
    .join("\n");

  let documentText = htmlFile?.content ||
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main id="app"></main></body></html>';

  const cspTag = '<meta http-equiv="Content-Security-Policy" content="' + PREVIEW_CSP + '">';
  if (/<head(?:\s[^>]*)?>/i.test(documentText)) {
    documentText = documentText.replace(/<head(?:\s[^>]*)?>/i, (tag) => tag + cspTag + styleTag);
  } else if (/<html(?:\s[^>]*)?>/i.test(documentText)) {
    documentText = documentText.replace(/<html(?:\s[^>]*)?>/i, (tag) =>
      tag + "<head>" + cspTag + styleTag + "</head>",
    );
  } else {
    documentText = "<!doctype html><html><head>" + cspTag + styleTag + "</head><body>" + documentText + "</body></html>";
  }

  const executable = bridge + scriptTags;
  if (/<\/body>/i.test(documentText)) {
    documentText = documentText.replace(/<\/body>/i, executable + "</body>");
  } else {
    documentText += executable;
  }
  return documentText;
}

export default function LabSourceLivePreview({ files }) {
  const [executedFiles, setExecutedFiles] = useState(null);
  const [runNumber, setRunNumber] = useState(0);
  const [viewport, setViewport] = useState("desktop");
  const [logs, setLogs] = useState([]);
  const [frameState, setFrameState] = useState("idle");
  const frameRef = useRef(null);

  const supportedFiles = useMemo(
    () => (executedFiles || []).filter((file) =>
      ["html", "htm", "css", "js", "mjs"].includes(extension(file.path)),
    ),
    [executedFiles],
  );
  const ignoredFiles = useMemo(
    () => (executedFiles || []).filter((file) =>
      !["html", "htm", "css", "js", "mjs", "md", "markdown", "txt", "json", "svg"].includes(extension(file.path)),
    ),
    [executedFiles],
  );
  const srcDoc = useMemo(
    () => executedFiles ? buildDocument(supportedFiles) : "",
    [executedFiles, supportedFiles, runNumber],
  );

  useEffect(() => {
    const onMessage = (event) => {
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      if (event.data?.type !== "labs-preview-console") return;
      setLogs((current) => [
        ...current.slice(-79),
        {
          id: current.length ? current[current.length - 1].id + 1 : 1,
          level: ["log", "info", "warn", "error"].includes(event.data.level) ? event.data.level : "log",
          message: String(event.data.message || "").slice(0, 1800),
        },
      ]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function runPreview() {
    const snapshot = files.map((file) => ({ ...file }));
    const executableCount = snapshot.filter((file) =>
      ["html", "htm", "css", "js", "mjs"].includes(extension(file.path)),
    ).length;
    if (!executableCount) {
      setLogs([{ id: 1, level: "error", message: "Add an index.html, CSS file or JavaScript file to run a preview." }]);
      return;
    }
    setLogs([]);
    setFrameState("running");
    setExecutedFiles(snapshot);
    setRunNumber((value) => value + 1);
  }

  function restartPreview() {
    setLogs([]);
    setFrameState("running");
    setRunNumber((value) => value + 1);
  }

  return (
    <aside className="min-w-0 self-start border border-border bg-surface-1 xl:sticky xl:top-5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <span className="border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-warning">Sandboxed</span>
          </div>
          <p className="mt-1 text-[10px] text-text-tertiary">HTML · CSS · JavaScript</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setViewport("desktop")} aria-pressed={viewport === "desktop"} title="Desktop preview" className={["grid h-8 w-8 place-items-center border", viewport === "desktop" ? "border-brand bg-brand-soft text-brand" : "border-border text-text-tertiary"].join(" ")}>
            <Monitor size={14} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setViewport("mobile")} aria-pressed={viewport === "mobile"} title="Mobile preview" className={["grid h-8 w-8 place-items-center border", viewport === "mobile" ? "border-brand bg-brand-soft text-brand" : "border-border text-text-tertiary"].join(" ")}>
            <Smartphone size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-[10px] leading-4 text-text-tertiary">
          Runs the current editor content. Network and parent-page access are blocked.
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={restartPreview} disabled={!executedFiles} title="Restart last preview" className="grid h-8 w-8 place-items-center border border-border text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40">
            <RefreshCw size={13} aria-hidden="true" />
          </button>
          <button type="button" onClick={runPreview} className="inline-flex h-8 items-center gap-1.5 bg-brand px-2.5 text-[11px] font-semibold text-brand-contrast hover:bg-brand-hover">
            <Play size={12} aria-hidden="true" />
            Run
          </button>
        </div>
      </div>

      <div className="flex min-h-[420px] justify-center overflow-hidden bg-background p-2">
        {executedFiles ? (
          <iframe
            key={runNumber}
            ref={frameRef}
            title="Isolated experiment preview"
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={srcDoc}
            onLoad={() => setFrameState("ready")}
            className="h-[520px] border border-border bg-white"
            style={{ width: viewport === "mobile" ? "375px" : "100%", maxWidth: "100%" }}
          />
        ) : (
          <div className="grid min-h-[400px] w-full place-items-center border border-dashed border-border px-5 text-center">
            <div>
              <Play size={20} className="mx-auto text-text-tertiary" aria-hidden="true" />
              <p className="mt-3 text-xs font-semibold">Preview is not running</p>
              <p className="mt-1 max-w-xs text-[10px] leading-5 text-text-tertiary">
                Add an HTML, CSS or JavaScript file, then press Run to execute your current code in isolation.
              </p>
            </div>
          </div>
        )}
      </div>

      {executedFiles && ignoredFiles.length ? (
        <p className="flex items-start gap-2 border-t border-border px-3 py-2 text-[10px] leading-4 text-text-tertiary">
          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          {ignoredFiles.map((file) => file.path).join(", ")} are stored but not executed by this first preview runner. React/JSX/TypeScript bundling is a separate runtime phase.
        </p>
      ) : null}

      <section className="border-t border-border">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-text-tertiary" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold">Console</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-tertiary">{frameState === "ready" ? "Ready" : frameState === "running" ? "Starting" : "Idle"}</span>
            <button type="button" onClick={() => setLogs([])} className="text-[10px] text-text-tertiary hover:text-text-primary">Clear</button>
          </div>
        </div>
        <div className="max-h-36 min-h-12 overflow-y-auto bg-surface-inset px-3 py-2">
          {logs.length ? logs.map((entry) => (
            <p key={entry.id} className={["whitespace-pre-wrap break-words py-0.5 font-mono text-[10px]", entry.level === "error" ? "text-error" : entry.level === "warn" ? "text-warning" : "text-text-secondary"].join(" ")}>
              <span className="mr-2 opacity-60">{entry.level}</span>{entry.message}
            </p>
          )) : (
            <p className="font-mono text-[10px] text-text-tertiary">No console output.</p>
          )}
        </div>
      </section>
    </aside>
  );
}
