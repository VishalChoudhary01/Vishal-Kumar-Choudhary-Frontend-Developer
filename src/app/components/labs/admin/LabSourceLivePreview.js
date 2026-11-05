"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Monitor, Play, RefreshCw, Smartphone, Terminal } from "lucide-react";

export default function LabSourceLivePreview({ slug, files }) {
  const [run, setRun] = useState(null);
  const [viewport, setViewport] = useState("desktop");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const frameRef = useRef(null);

  let frameOrigin = "";
  if (run?.previewUrl) {
    try { frameOrigin = new URL(run.previewUrl).origin; } catch { frameOrigin = ""; }
  }

  useEffect(() => {
    const onMessage = (event) => {
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      if (frameOrigin && event.origin !== frameOrigin && event.origin !== "null") return;
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "labs-preview-ready") {
        setStatus("ready");
        return;
      }
      if (event.data.type !== "labs-preview-console") return;

      const level = ["log", "info", "warn", "error"].includes(event.data.level)
        ? event.data.level
        : "log";
      const message = typeof event.data.message === "string"
        ? event.data.message.slice(0, 1200)
        : "Console message";

      setLogs((current) => [
        ...current.slice(-79),
        { id: current.length ? current[current.length - 1].id + 1 : 1, level, message },
      ]);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameOrigin]);

  async function runPreview() {
    setBusy(true);
    setStatus("building");
    setLogs([]);
    setError("");

    try {
      const response = await fetch(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(slug) + "/preview",
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: files.map((file) => ({
              path: file.path,
              language: file.language,
              content: file.content,
            })),
          }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.data?.previewUrl) {
        throw new Error(payload?.error?.message || "The experiment could not be compiled.");
      }

      setRun(payload.data);
      setStatus("starting");
    } catch (reason) {
      setError(reason.message || "The preview could not be started.");
      setStatus("failed");
    } finally {
      setBusy(false);
    }
  }

  const expiresAt = run?.expiresAt ? new Date(run.expiresAt) : null;

  return (
    <aside className="min-w-0 self-start border border-border bg-surface-1 xl:sticky xl:top-5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <span className="border border-brand/30 bg-brand-soft/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand">
              Isolated
            </span>
          </div>
          <p className="mt-1 text-[10px] text-text-tertiary">
            React · JSX · Motion · Tailwind CSS v4
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            aria-pressed={viewport === "desktop"}
            title="Desktop preview"
            className={["grid h-8 w-8 place-items-center border", viewport === "desktop" ? "border-brand bg-brand-soft text-brand" : "border-border text-text-tertiary"].join(" ")}
          >
            <Monitor size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            aria-pressed={viewport === "mobile"}
            title="Mobile preview"
            className={["grid h-8 w-8 place-items-center border", viewport === "mobile" ? "border-brand bg-brand-soft text-brand" : "border-border text-text-tertiary"].join(" ")}
          >
            <Smartphone size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-[10px] leading-4 text-text-tertiary">
          Builds this working copy in a temporary VM. Preview sessions expire automatically.
        </p>
        <button
          type="button"
          onClick={runPreview}
          disabled={busy || !files.length}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 bg-brand px-2.5 text-[11px] font-semibold text-brand-contrast hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <RefreshCw size={12} className="animate-spin" aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
          {busy ? "Building…" : run ? "Run again" : "Run"}
        </button>
      </div>

      <div className="flex min-h-[420px] justify-center overflow-hidden bg-background p-2">
        {run?.previewUrl ? (
          <iframe
            key={run.runId}
            ref={frameRef}
            title="Isolated React experiment preview"
            src={run.previewUrl}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            allow="fullscreen"
            onLoad={() => setStatus((current) => current === "starting" ? "loading" : current)}
            className="h-[520px] border border-border bg-white"
            style={{ width: viewport === "mobile" ? "375px" : "100%", maxWidth: "100%" }}
          />
        ) : (
          <div className="grid min-h-[400px] w-full place-items-center border border-dashed border-border px-5 text-center">
            <div>
              <Play size={20} className="mx-auto text-text-tertiary" aria-hidden="true" />
              <p className="mt-3 text-xs font-semibold">Preview is not running</p>
              <p className="mt-1 max-w-xs text-[10px] leading-5 text-text-tertiary">
                Run compiles the current unsaved editor content. Build errors appear below without changing your working copy.
              </p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-2 border-t border-border bg-warning/5 px-3 py-2.5 text-[10px] leading-5 text-warning">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="break-words">{error}</span>
        </div>
      ) : null}

      {run && expiresAt ? (
        <p className="border-t border-border px-3 py-2 text-[10px] text-text-tertiary">
          Temporary preview · Expires {expiresAt.toLocaleTimeString()}
        </p>
      ) : null}

      <section className="border-t border-border">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-text-tertiary" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold">Console</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-tertiary">
              {status === "ready" ? "Ready" : status === "building" ? "Building" : status === "starting" || status === "loading" ? "Starting" : status === "failed" ? "Build failed" : "Idle"}
            </span>
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
