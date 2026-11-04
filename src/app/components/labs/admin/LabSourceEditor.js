"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  FilePlus2,
  FileUp,
  LoaderCircle,
  Save,
  Upload,
  X,
} from "lucide-react";

const LANGUAGES = [
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "css",
  "html",
  "json",
  "markdown",
  "text",
  "svg",
];

function makeRequestId() {
  return globalThis.crypto?.randomUUID?.() ||
    "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

function validateDraftFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 40) {
    return "A source snapshot must contain between 1 and 40 files.";
  }

  const seenPaths = new Set();
  let totalBytes = 0;
  const safePathPattern = /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;
  const secretFilePattern = /(^|\/)\.env(?:\.|$)|(^|\/)(?:id_rsa|id_ed25519|credentials(?:\.json)?|secrets?\.(?:json|ya?ml))$/i;

  for (const file of files) {
    const path = typeof file?.path === "string" ? file.path.trim() : "";
    if (
      !safePathPattern.test(path) ||
      path.split("/").some((segment) => !segment || segment === "." || segment === "..") ||
      /[\u0000-\u001f\u007f]/.test(path) ||
      secretFilePattern.test(path)
    ) {
      return "A file path is invalid or uses a restricted name. Check the path and remove environment/credential files.";
    }

    const normalizedPath = path.toLowerCase();
    if (seenPaths.has(normalizedPath)) {
      return "File paths must be unique. Rename the duplicate file before saving.";
    }
    seenPaths.add(normalizedPath);

    if (!LANGUAGES.includes(file.language)) {
      return "Choose a supported language for every file.";
    }
    if (typeof file.content !== "string" || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(file.content)) {
      return "Source files must contain plain text only.";
    }

    const bytes = new TextEncoder().encode(file.content).length;
    if (bytes > 500000) return "Each source file must be 500 KB or smaller.";
    totalBytes += bytes;
    if (totalBytes > 1000000) return "The complete source snapshot must be 1 MB or smaller.";
  }

  return "";
}

export default function LabSourceEditor({ initialSource, initialVersions, initialAudit }) {
  const [source, setSource] = useState(initialSource);
  const [files, setFiles] = useState(initialSource.files || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [versions, setVersions] = useState(initialVersions || []);
  const [audit, setAudit] = useState(initialAudit || []);
  const [changeSummary, setChangeSummary] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  function moveFile(fromIndex, toIndex) {
    if (
      busy ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= files.length ||
      toIndex >= files.length
    ) {
      return;
    }

    const selectedFileBeforeMove = files[selectedIndex];
    const reorderedFiles = [...files];
    const [movedFile] = reorderedFiles.splice(fromIndex, 1);
    reorderedFiles.splice(toIndex, 0, movedFile);

    setFiles(reorderedFiles);
    setSelectedIndex(Math.max(0, reorderedFiles.indexOf(selectedFileBeforeMove)));
    setError("");
    setMessage("File order changed. Save the draft to preserve this order.");
  }


  const selectedFile = files[selectedIndex] || null;
  const totalBytes = useMemo(
    () => files.reduce((total, file) => total + new TextEncoder().encode(file.content || "").length, 0),
    [files],
  );

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(files) !== JSON.stringify(source.files || []),
    [files, source.files],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;

    const warnBeforeLeave = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedChanges]);

  function updateSelected(patch) {
    setFiles((current) =>
      current.map((file, index) => index === selectedIndex ? { ...file, ...patch } : file),
    );
  }

  function getUniquePath(candidate, existingFiles = files) {
    const normalized = candidate.toLowerCase();
    if (!existingFiles.some((file) => file.path.toLowerCase() === normalized)) {
      return candidate;
    }

    const dot = candidate.lastIndexOf(".");
    const base = dot > candidate.lastIndexOf("/") ? candidate.slice(0, dot) : candidate;
    const extension = dot > candidate.lastIndexOf("/") ? candidate.slice(dot) : "";

    let suffix = 2;
    let nextPath = base + "-" + suffix + extension;
    while (existingFiles.some((file) => file.path.toLowerCase() === nextPath.toLowerCase())) {
      suffix += 1;
      nextPath = base + "-" + suffix + extension;
    }
    return nextPath;
  }

  function addFile() {
    if (files.length >= 40) {
      setError("A source snapshot can contain at most 40 files.");
      return;
    }

    const next = files.length;
    const path = getUniquePath("src/new-file.js");
    setFiles((current) => [
      ...current,
      { path, language: "javascript", content: "" },
    ]);
    setSelectedIndex(next);
    setError("");
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const languageByExtension = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      css: "css",
      html: "html",
      htm: "html",
      json: "json",
      md: "markdown",
      markdown: "markdown",
      txt: "text",
      svg: "svg",
    };
    const language = languageByExtension[extension];

    if (!language) {
      setError("Choose a supported source file: JS, JSX, TS, TSX, CSS, HTML, JSON, Markdown, TXT or SVG.");
      return;
    }
    if (file.size > 500000) {
      setError("Each imported file must be 500 KB or smaller.");
      return;
    }
    if (files.length >= 40) {
      setError("A source snapshot can contain at most 40 files.");
      return;
    }
    if (totalBytes + file.size > 1000000) {
      setError("The complete source snapshot must be 1 MB or smaller.");
      return;
    }

    try {
      const content = await file.text();
      if (content.includes("\u0000")) {
        setError("Binary files cannot be imported as source text.");
        return;
      }

      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "-");
      const nextPath = getUniquePath("src/" + safeName);
      const nextIndex = files.length;
      setFiles((current) => [
        ...current,
        { path: nextPath, language, content },
      ]);
      setSelectedIndex(nextIndex);
      setError("");
      setMessage(file.name + " imported. Save the draft to keep this version.");
    } catch {
      setError("This file could not be read. Try copying its text into the editor.");
    }
  }

  function removeSelectedFile() {
    if (!selectedFile) return;
    if (!window.confirm("Remove " + selectedFile.path + " from this draft?")) return;
    setFiles((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, files.length - 2)));
  }

  async function requestJson(url, method = "GET", body) {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || "The request could not be completed.");
    return payload.data;
  }

  async function refreshSource() {
    const base = "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug);
    const [nextSource, nextVersions, nextAudit] = await Promise.all([
      requestJson(base),
      requestJson(base + "/versions"),
      requestJson(base + "/audit?limit=20"),
    ]);
    setSource(nextSource);
    setFiles(nextSource.files || []);
    setVersions(nextVersions || []);
    setAudit(nextAudit || []);
    setSelectedIndex(0);
  }

  async function refreshAudit() {
    const nextAudit = await requestJson(
      "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/audit?limit=20",
    );
    setAudit(nextAudit || []);
  }

  async function saveDraft() {
    const validationError = validateDraftFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy("save");
    setError("");
    setMessage("");

    try {
      const data = await requestJson(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/versions",
        "POST",
        {
          files,
          expectedDraftVersionId: source.draftVersionId || null,
          changeSummary,
          requestId: makeRequestId(),
        },
      );

      setSource((current) => ({
        ...current,
        draftVersionId: data.versionId,
        draft: {
          versionId: data.versionId,
          version: data.version,
          contentHash: data.contentHash,
        },
        files,
      }));
      setChangeSummary("");
      setMessage(data.version + " saved as a private draft.");
      try {
        const [nextVersions] = await Promise.all([
          requestJson("/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/versions"),
          refreshAudit(),
        ]);
        setVersions(nextVersions || []);
      } catch {
        setMessage(data.version + " was saved. The history panel could not refresh; reload the page to see the latest activity.");
      }
    } catch (reason) {
      setError(reason.message || "The draft could not be saved.");
    } finally {
      setBusy("");
    }
  }

  async function publishDraft() {
    const versionId = source.draftVersionId;
    if (!versionId) return;

    setBusy("publish");
    setError("");
    setMessage("");

    try {
      await requestJson(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/publish",
        "POST",
        {
          versionId,
          expectedPublishedVersionId: source.publishedVersionId || null,
          requestId: makeRequestId(),
        },
      );
      setSource((current) => ({
        ...current,
        published: true,
        publishedVersionId: versionId,
      }));
      setConfirmPublish(false);
      setMessage("Source published. Every verified account can now access this version.");
      try {
        await refreshAudit();
      } catch {
        setMessage("Source was published. The audit timeline could not refresh; reload the page to see the latest activity.");
      }
    } catch (reason) {
      setError(reason.message || "Source could not be published.");
    } finally {
      setBusy("");
    }
  }

  async function unpublishSource() {
    setBusy("unpublish");
    setError("");
    setMessage("");

    try {
      await requestJson(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/unpublish",
        "POST",
        {
          expectedPublishedVersionId: source.publishedVersionId || null,
          requestId: makeRequestId(),
        },
      );
      setSource((current) => ({
        ...current,
        published: false,
        publishedVersionId: null,
      }));
      setConfirmUnpublish(false);
      setMessage("Source unpublished. New source requests are now blocked.");
      try {
        await refreshAudit();
      } catch {
        setMessage("Source was unpublished. The audit timeline could not refresh; reload the page to see the latest activity.");
      }
    } catch (reason) {
      setError(reason.message || "Source could not be unpublished.");
    } finally {
      setBusy("");
    }
  }

  async function viewVersion(versionId) {
    setPreviewLoading(true);
    setError("");

    try {
      const version = await requestJson(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) +
          "/versions/" + encodeURIComponent(versionId),
      );
      setPreviewVersion(version);
      setPreviewFileIndex(0);
    } catch (reason) {
      setError(reason.message || "The selected version could not be loaded.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function restoreVersion(versionId, versionLabel) {
    const restoreMessage = hasUnsavedChanges
      ? "Restore " + versionLabel + " as a new draft? This replaces the current unsaved editor contents. Existing saved versions remain unchanged."
      : "Restore " + versionLabel + " as a new draft? Existing saved versions remain unchanged.";
    if (!window.confirm(restoreMessage)) return;

    setBusy("restore");
    setError("");
    setMessage("");

    try {
      await requestJson(
        "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) +
          "/restore/" + encodeURIComponent(versionId),
        "POST",
        {
          expectedDraftVersionId: source.draftVersionId || null,
          requestId: makeRequestId(),
        },
      );
      setMessage(versionLabel + " restored as a new draft.");
      try {
        await refreshSource();
      } catch {
        setMessage(versionLabel + " was restored. Reload the workspace to refresh the source and version history.");
      }
    } catch (reason) {
      setError(reason.message || "The selected version could not be restored.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <Link
          href="/admin/labs/sources"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Source dashboard
        </Link>

        <header className="mt-8 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">OWNER SOURCE WORKSPACE</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{source.title}</h1>
            <p className="mt-1 text-xs text-text-tertiary">{source.slug}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className={source.published ? "border border-brand/40 bg-brand-soft px-2 py-1 text-brand" : "border border-border px-2 py-1 text-text-tertiary"}>
                {source.published ? "Published" : "Unpublished"}
              </span>
              <span className="border border-border px-2 py-1 text-text-tertiary">
                {source.draft?.version || "No saved draft"}
              </span>
              {source.publishedVersion ? (
                <span className="border border-border px-2 py-1 text-text-tertiary">
                  Live: {source.publishedVersion.version}
                </span>
              ) : null}
              {hasUnsavedChanges ? (
                <span className="border border-warning/40 bg-warning/10 px-2 py-1 text-warning">Unsaved edits</span>
              ) : (
                <span className="border border-border px-2 py-1 text-text-tertiary">Working copy saved</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {source.isCustom ? (
              <span className="inline-flex h-9 items-center border border-border px-3 text-xs text-text-tertiary">
                Private experiment draft
              </span>
            ) : (
              <Link
                href={"/labs/" + encodeURIComponent(source.slug)}
                target="_blank"
                className="inline-flex h-9 items-center border border-border px-3 text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                View experiment
              </Link>
            )}
          </div>
        </header>

        <section aria-label="Source snapshot summary" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Files in working copy", value: files.length + " / 40" },
            { label: "Snapshot size", value: (totalBytes / 1024).toFixed(1) + " KB / 1000 KB" },
            { label: "Saved draft", value: source.draft?.version || "Not saved" },
            { label: "Published version", value: source.publishedVersion?.version || "Not published" },
          ].map((metric) => (
            <div key={metric.label} className="border border-border bg-surface-1 px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">{metric.label}</p>
              <p className="mt-1 truncate text-sm font-semibold tabular-nums" title={metric.value}>{metric.value}</p>
            </div>
          ))}
        </section>

        {message ? <p role="status" className="mt-4 border border-brand/30 bg-brand-soft/30 px-3 py-2 text-xs text-brand">{message}</p> : null}
        {error ? <p role="alert" className="mt-4 border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p> : null}

        <section className="mt-6 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-sm border border-border bg-surface-1 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Files</h2>
                <p className="mt-1 text-[10px] text-text-tertiary">Drag to reorder or use the arrow controls.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1 border border-border px-2 text-[11px] font-semibold hover:border-brand hover:text-brand">
                  <FileUp size={13} aria-hidden="true" />
                  Import
                  <input
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.css,.html,.htm,.json,.md,.markdown,.txt,.svg"
                    onChange={importFile}
                    disabled={files.length >= 40}
                    className="sr-only"
                    aria-label="Import a source file"
                  />
                </label>
                <button
                  type="button"
                  onClick={addFile}
                  disabled={files.length >= 40}
                  className="inline-flex h-8 items-center gap-1 border border-border px-2 text-[11px] font-semibold hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <FilePlus2 size={13} aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {files.map((file, index) => {
                const originalFile = (source.files || []).find((candidate) => candidate.path === file.path);
                const fileState = !originalFile
                  ? "New"
                  : originalFile.content !== file.content || originalFile.language !== file.language
                    ? "Edited"
                    : "";

                return (
                  <div
                    key={file.path + "-" + index}
                    draggable={!busy && files.length > 1}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                      moveFile(fromIndex, index);
                    }}
                    className={[
                      "flex items-stretch gap-1 border-l-2 transition-colors",
                      selectedIndex === index
                        ? "border-brand bg-brand-soft text-text-primary"
                        : "border-transparent text-text-secondary hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      aria-pressed={selectedIndex === index}
                      className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 px-2 py-2 text-left text-xs"
                    >
                      <span className="min-w-0 truncate">{file.path}</span>
                      {fileState ? (
                        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-warning">{fileState}</span>
                      ) : null}
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5 pr-1">
                      <button
                        type="button"
                        onClick={() => moveFile(index, index - 1)}
                        disabled={index === 0 || Boolean(busy)}
                        aria-label={"Move " + file.path + " up"}
                        title="Move up"
                        className="grid h-7 w-7 place-items-center text-text-tertiary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp size={13} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, index + 1)}
                        disabled={index === files.length - 1 || Boolean(busy)}
                        aria-label={"Move " + file.path + " down"}
                        title="Move down"
                        className="grid h-7 w-7 place-items-center text-text-tertiary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowDown size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!files.length ? (
                <p className="px-2 py-5 text-xs leading-5 text-text-tertiary">No files yet. Add a file to begin your source snapshot.</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-border pt-4 text-xs text-text-tertiary">
              <p>{files.length} / 40 files</p>
              <p className="mt-1 tabular-nums">{(totalBytes / 1024).toFixed(1)} KB / 1000 KB</p>
            </div>
          </aside>

          <div className="min-w-0 rounded-sm border border-border bg-surface-1 p-4 sm:p-5">
            {selectedFile ? (
              <>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-text-tertiary">File path</span>
                    <input
                      value={selectedFile.path}
                      onChange={(event) => updateSelected({ path: event.target.value })}
                      spellCheck={false}
                      className="h-9 w-full border border-border bg-background px-3 text-xs text-text-primary outline-none focus:border-brand"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-text-tertiary">Language</span>
                    <select
                      value={selectedFile.language}
                      onChange={(event) => updateSelected({ language: event.target.value })}
                      className="h-9 w-full border border-border bg-background px-2 text-xs text-text-primary outline-none focus:border-brand"
                    >
                      {LANGUAGES.map((language) => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      disabled={files.length <= 1 || Boolean(busy)}
                      title={files.length <= 1 ? "A saved source snapshot must contain at least one file." : "Remove selected file"}
                      className="inline-flex h-9 items-center gap-1 border border-border px-3 text-xs text-text-secondary hover:border-warning hover:text-warning disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X size={13} aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
                <label className="mt-4 block">
                  <span className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
                    <span>Source content</span>
                    <span className="font-mono normal-case tracking-normal">
                      {new TextEncoder().encode(selectedFile.content || "").length.toLocaleString("en-IN")} bytes · {(selectedFile.content || "").split("\n").length} lines
                    </span>
                  </span>
                  <textarea
                    value={selectedFile.content}
                    onChange={(event) => updateSelected({ content: event.target.value })}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="min-h-[520px] w-full resize-y border border-border bg-surface-inset p-4 font-mono text-xs leading-6 text-text-primary outline-none focus:border-brand"
                    placeholder="Paste or write the source code here…"
                  />
                </label>
              </>
            ) : (
              <div className="grid min-h-[520px] place-items-center text-center">
                <div>
                  <FilePlus2 size={22} className="mx-auto text-text-tertiary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium">Start with a source file</p>
                  <p className="mt-1 text-xs text-text-tertiary">Source is private until you explicitly publish it.</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="block min-w-0 flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-text-tertiary">Change summary (optional)</span>
                <input
                  value={changeSummary}
                  onChange={(event) => setChangeSummary(event.target.value)}
                  maxLength={500}
                  placeholder="Describe this draft"
                  className="h-9 w-full border border-border bg-background px-3 text-xs outline-none focus:border-brand"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={Boolean(busy) || !hasUnsavedChanges || !files.length}
                  className="inline-flex h-9 items-center gap-2 bg-brand px-4 text-xs font-semibold text-brand-contrast hover:bg-brand-hover disabled:opacity-50"
                >
                  {busy === "save" ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Save size={13} aria-hidden="true" />}
                  {busy === "save" ? "Saving…" : hasUnsavedChanges ? "Save draft" : "Draft saved"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Discard all unsaved file changes?")) {
                      setFiles(source.files || []);
                      setSelectedIndex(0);
                      setError("");
                    }
                  }}
                  disabled={!hasUnsavedChanges || Boolean(busy)}
                  className="h-9 border border-border px-3 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
                >
                  Discard edits
                </button>
              </div>
            </div>

            {source.isCustom ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold">Private experiment draft</p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
                  Your source files and versions can be saved here. Isolated live preview and public publishing will be enabled after the secure runtime phase is complete.
                </p>
              </div>
            ) : null}

            {!source.isCustom && source.draftVersionId ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs font-semibold">Publish saved draft</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Only the saved draft version can be published. Saving does not publish automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmPublish(true)}
                  disabled={Boolean(busy) || hasUnsavedChanges}
                  className="inline-flex h-9 items-center gap-2 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft disabled:opacity-40"
                >
                  <Upload size={13} aria-hidden="true" />
                  Publish draft
                </button>
              </div>
            ) : null}

            {!source.isCustom && source.published ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-tertiary">Published source is available to verified accounts.</p>
                <button
                  type="button"
                  onClick={() => setConfirmUnpublish(true)}
                  disabled={Boolean(busy)}
                  className="h-9 border border-warning/50 px-3 text-xs font-semibold text-warning hover:bg-warning/10 disabled:opacity-50"
                >
                  Unpublish source
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-8 rounded-sm border border-border bg-surface-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Version history</h2>
              <p className="mt-1 text-xs text-text-tertiary">Saved versions are immutable. Restore creates a new draft.</p>
            </div>
            <span className="text-xs text-text-tertiary">{versions.length} versions</span>
          </div>
          <div className="mt-4 divide-y divide-border">
            {versions.map((version) => (
              <div key={version.versionId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold">{version.version}</p>
                    {source.draftVersionId === version.versionId ? (
                      <span className="border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Draft</span>
                    ) : null}
                    {source.publishedVersionId === version.versionId ? (
                      <span className="border border-brand/40 bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-brand">Live</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-text-tertiary">
                    {version.fileCount} files · {version.changeSummary || "No summary"} · {version.createdAt ? new Date(version.createdAt).toLocaleString() : "Unknown date"}
                  </p>
                  <details className="mt-1 text-[10px] text-text-tertiary">
                    <summary className="w-fit cursor-pointer select-none hover:text-text-secondary">View content hash</summary>
                    <p className="mt-1 max-w-[520px] break-all font-mono">{version.contentHash}</p>
                  </details>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => viewVersion(version.versionId)}
                    disabled={Boolean(busy) || previewLoading}
                    className="inline-flex h-8 items-center gap-1 border border-border px-3 text-[11px] font-medium text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40"
                  >
                    <Eye size={12} aria-hidden="true" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => restoreVersion(version.versionId, version.version)}
                    disabled={Boolean(busy)}
                    className="h-8 border border-border px-3 text-[11px] font-medium text-text-secondary hover:border-brand hover:text-brand disabled:opacity-40"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
            {!versions.length ? <p className="py-5 text-xs text-text-tertiary">No saved versions yet.</p> : null}
          </div>
        </section>

        <section className="mt-8 rounded-sm border border-border bg-surface-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Source audit history</h2>
              <p className="mt-1 text-xs text-text-tertiary">Owner actions for this experiment. Historical entries are read-only.</p>
            </div>
            <span className="text-xs text-text-tertiary">{audit.length} recent entries</span>
          </div>
          <div className="mt-4 divide-y divide-border">
            {audit.map((event, index) => (
              <div key={(event.requestId || event.versionId || event.action) + "-" + index} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary">
                    {({
                      source_created: "Source record created",
                      experiment_created: "New experiment created",
                      draft_saved: "Draft version saved",
                      source_published: "Source published",
                      source_unpublished: "Source unpublished",
                      version_restored: "Previous version restored",
                      validation_failed: "Source validation failed",
                    })[event.action] || event.action}
                  </p>
                  <p className="mt-1 break-all font-mono text-[10px] text-text-tertiary">
                    {event.versionId || event.requestId || "No version reference"}
                  </p>
                </div>
                <time className="text-[11px] text-text-tertiary">
                  {event.createdAt ? new Date(event.createdAt).toLocaleString() : "Unknown time"}
                </time>
              </div>
            ))}
            {!audit.length ? (
              <p className="py-5 text-xs text-text-tertiary">No owner actions have been recorded for this source yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      {previewVersion ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-preview-title"
            className="flex max-h-[90svh] w-full max-w-5xl flex-col border border-border bg-surface-1 shadow-2xl"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">IMMUTABLE SOURCE VERSION</p>
                <h2 id="version-preview-title" className="mt-1 text-base font-semibold">{previewVersion.version}</h2>
                <p className="mt-1 break-all font-mono text-[10px] text-text-tertiary">{previewVersion.contentHash}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVersion(null)}
                className="h-8 border border-border px-3 text-xs text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <div className="flex flex-wrap gap-2">
                {previewVersion.files.map((file, index) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setPreviewFileIndex(index)}
                    aria-pressed={previewFileIndex === index}
                    className={[
                      "max-w-full truncate border px-3 py-2 text-xs",
                      previewFileIndex === index
                        ? "border-brand bg-brand-soft text-text-primary"
                        : "border-border text-text-secondary hover:bg-surface-2",
                    ].join(" ")}
                  >
                    {file.path}
                  </button>
                ))}
              </div>
              <div className="mt-3 min-h-0 flex-1 overflow-auto border border-border bg-surface-inset">
                <div className="sticky top-0 border-b border-border bg-surface-1 px-3 py-2 text-xs text-text-tertiary">
                  {previewVersion.files[previewFileIndex]?.path}
                </div>
                <pre className="min-h-[360px] overflow-auto p-4 font-mono text-xs leading-6 text-text-primary">
                  <code>{previewVersion.files[previewFileIndex]?.content}</code>
                </pre>
              </div>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-xs text-text-tertiary">Read-only snapshot. Restoring creates a new draft.</p>
              <button
                type="button"
                onClick={() => {
                  const versionId = previewVersion.versionId;
                  const versionLabel = previewVersion.version;
                  setPreviewVersion(null);
                  restoreVersion(versionId, versionLabel);
                }}
                disabled={Boolean(busy)}
                className="h-9 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft disabled:opacity-40"
              >
                Restore as new draft
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {confirmPublish ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="publish-title" className="w-full max-w-md border border-border bg-surface-1 p-5 shadow-2xl">
            <h2 id="publish-title" className="text-base font-semibold">Publish this source version?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This will make {source.draft?.version || "the saved draft"} available to every account with a verified email. Anonymous visitors will still not be able to view the code.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmPublish(false)} className="h-9 border border-border px-3 text-xs">Cancel</button>
              <button type="button" onClick={publishDraft} disabled={Boolean(busy)} className="h-9 bg-brand px-3 text-xs font-semibold text-brand-contrast disabled:opacity-50">
                {busy === "publish" ? "Publishing…" : "Confirm publish"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmUnpublish ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="unpublish-title" className="w-full max-w-md border border-border bg-surface-1 p-5 shadow-2xl">
            <h2 id="unpublish-title" className="text-base font-semibold">Unpublish this source?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              New source requests will be blocked for every verified account. Existing version history and engagement records will remain.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmUnpublish(false)} className="h-9 border border-border px-3 text-xs">Cancel</button>
              <button type="button" onClick={unpublishSource} disabled={Boolean(busy)} className="h-9 border border-warning/50 px-3 text-xs font-semibold text-warning disabled:opacity-50">
                {busy === "unpublish" ? "Unpublishing…" : "Confirm unpublish"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
