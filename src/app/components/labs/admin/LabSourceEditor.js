"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionToast } from "@/app/providers/ActionToastProvider";
import LabSourceLivePreview from "./LabSourceLivePreview";
import LabMediaLibrary from "./LabMediaLibrary";
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
  Trash2,
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

function formatTimestamp(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 19).replace("T", " ") + " UTC";
}

export default function LabSourceEditor({ initialSource, initialVersions, initialAudit }) {
  const router = useRouter();
  const { showToast } = useActionToast();
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [previewVersion, setPreviewVersion] = useState(null);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [publishStage, setPublishStage] = useState("");
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

  function createHtmlStarter() {
    const templates = [
      {
        path: "index.html",
        language: "html",
        content: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>HTML and CSS experiment</title>\n    <link rel=\"stylesheet\" href=\"./styles.css\" />\n  </head>\n  <body>\n    <main class=\"demo-card\">\n      <p class=\"eyebrow\">LABS · STATIC WEB</p>\n      <h1>Your HTML/CSS preview is ready.</h1>\n      <p>Edit index.html and styles.css, then press Run.</p>\n      <button id=\"demo-button\" type=\"button\">Test JavaScript</button>\n      <p id=\"demo-status\" aria-live=\"polite\"></p>\n    </main>\n    <script type=\"module\" src=\"./main.js\"></script>\n  </body>\n</html>\n",
      },
      {
        path: "styles.css",
        language: "css",
        content: ":root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #0b0b0e; color: #f8fafc; }\n* { box-sizing: border-box; }\nbody { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; }\n.demo-card { width: min(100%, 640px); padding: 40px; border: 1px solid #ffffff24; background: #ffffff08; }\n.eyebrow { color: #5eead4; font-size: 12px; letter-spacing: .16em; }\nh1 { margin: 20px 0 12px; font-size: clamp(2rem, 6vw, 3.5rem); }\np { color: #a1a1aa; line-height: 1.7; }\nbutton { margin-top: 18px; padding: 12px 16px; border: 0; background: #5eead4; color: #0b0b0e; font-weight: 700; cursor: pointer; }\n",
      },
      {
        path: "main.js",
        language: "javascript",
        content: "const button = document.querySelector(\"#demo-button\");\nconst status = document.querySelector(\"#demo-status\");\nbutton?.addEventListener(\"click\", () => {\n  status.textContent = \"HTML, CSS and JavaScript are running.\";\n});\n",
      },
    ];

    const additions = templates.filter((template) => !files.some((file) => file.path === template.path));
    if (files.length + additions.length > 40) {
      setError("There is not enough room for the HTML/CSS starter files. Remove unused files and try again.");
      return;
    }

    const nextFiles = [...files, ...additions];
    setFiles(nextFiles);
    setSelectedIndex(Math.max(0, nextFiles.findIndex((file) => file.path === "index.html")));
    setError("");
    setMessage(additions.length ? "HTML/CSS starter added. Edit index.html and styles.css, then press Run." : "The HTML/CSS starter files already exist.");
    showToast("success", "HTML/CSS starter added.");
  }

  function createReactStarter() {
    const templates = [
      {
        path: "index.html",
        language: "html",
        content: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"theme-color\" content=\"#0b0b0e\" />\n    <title>Labs experiment</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"./src/main.jsx\"></script>\n  </body>\n</html>\n",
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: "import React from \"react\";\nimport { createRoot } from \"react-dom/client\";\nimport App from \"./App.jsx\";\nimport \"./index.css\";\n\ncreateRoot(document.getElementById(\"root\")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n",
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: "import { useState } from \"react\";\nimport { motion, useReducedMotion } from \"motion/react\";\nimport { ArrowUpRight, Sparkles } from \"lucide-react\";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  const reduceMotion = useReducedMotion();\n\n  return (\n    <main className=\"relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0e] px-6 py-16 text-white\">\n      <div aria-hidden=\"true\" className=\"pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(7,162,144,0.22),transparent_55%)]\" />\n      <motion.section\n        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}\n        animate={{ opacity: 1, y: 0, scale: 1 }}\n        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}\n        className=\"relative w-full max-w-xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10\"\n      >\n        <div className=\"flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300\">\n          <Sparkles size={15} aria-hidden=\"true\" />\n          React + Motion + Tailwind v4\n        </div>\n        <h1 className=\"mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl\">Your experiment starts here.</h1>\n        <p className=\"mt-4 max-w-lg text-sm leading-7 text-white/60\">Edit this component, add files and animations, then press Run to compile your current working copy in an isolated preview.</p>\n        <div className=\"mt-8 flex flex-wrap items-center gap-3\">\n          <button type=\"button\" onClick={() => setCount((value) => value + 1)} className=\"inline-flex h-11 items-center gap-2 bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300\">\n            Count: {count}\n            <ArrowUpRight size={15} aria-hidden=\"true\" />\n          </button>\n          <span className=\"text-xs text-white/40\">A working React state example</span>\n        </div>\n      </motion.section>\n    </main>\n  );\n}\n",
      },
      {
        path: "src/index.css",
        language: "css",
        content: "@import \"tailwindcss\";\n\n:root {\n  color-scheme: dark;\n  font-synthesis: none;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n}\n\nhtml, body, #root { min-height: 100%; }\nbody { margin: 0; }\n",
      },
    ];

    if (files.length + templates.filter((template) => !files.some((file) => file.path === template.path)).length > 40) {
      setError("There is not enough room for the React starter files. Remove unused files and try again.");
      return;
    }

    const additions = templates.filter((template) => !files.some((file) => file.path === template.path));
    const nextFiles = [...files, ...additions];
    setFiles(nextFiles);
    setSelectedIndex(Math.max(0, nextFiles.findIndex((file) => file.path === "src/App.jsx")));
    setError("");
    setMessage(additions.length ? "React starter added. Edit src/App.jsx and press Run to execute it." : "The React starter entry files already exist.");
  }

  function createReactTsStarter() {
    const templates = [
      {
        path: "index.html",
        language: "html",
        content: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Labs TypeScript experiment</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"./src/main.tsx\"></script>\n  </body>\n</html>\n",
      },
      {
        path: "src/main.tsx",
        language: "tsx",
        content: "import React from \"react\";\nimport { createRoot } from \"react-dom/client\";\nimport App from \"./App.tsx\";\nimport \"./index.css\";\n\ncreateRoot(document.getElementById(\"root\")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n",
      },
      {
        path: "src/App.tsx",
        language: "tsx",
        content: "import { useState } from \"react\";\nimport { motion, useReducedMotion } from \"motion/react\";\nimport { Sparkles } from \"lucide-react\";\nimport { FiActivity, FiArrowUpRight } from \"react-icons/fi\";\n\nexport default function App() {\n  const [count, setCount] = useState<number>(0);\n  const reduceMotion = useReducedMotion();\n\n  return (\n    <main className=\"grid min-h-screen place-items-center bg-slate-950 px-6 py-16 text-white\">\n      <motion.section\n        initial={reduceMotion ? false : { opacity: 0, y: 24 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className=\"w-full max-w-xl border border-white/10 bg-white/[0.04] p-8 sm:p-10\"\n      >\n        <div className=\"flex items-center gap-2 text-teal-300\">\n          <Sparkles aria-hidden=\"true\" />\n          <FiActivity aria-hidden=\"true\" />\n          React + TypeScript + Motion + Tailwind v4\n        </div>\n        <h1 className=\"mt-6 text-3xl font-semibold\">Your TSX experiment is running.</h1>\n        <button type=\"button\" onClick={() => setCount((value) => value + 1)} className=\"mt-6 inline-flex items-center gap-2 bg-teal-300 px-4 py-3 font-semibold text-slate-950\">\n          Count: {count}\n          <FiArrowUpRight aria-hidden=\"true\" />\n        </button>\n      </motion.section>\n    </main>\n  );\n}\n",
      },
      {
        path: "src/index.css",
        language: "css",
        content: "@import \"tailwindcss\";\n\n:root { color-scheme: dark; font-synthesis: none; text-rendering: optimizeLegibility; }\nhtml, body, #root { min-height: 100%; }\nbody { margin: 0; }\n",
      },
    ];

    if (files.length + templates.filter((template) => !files.some((file) => file.path === template.path)).length > 40) {
      setError("There is not enough room for the TypeScript starter files. Remove unused files and try again.");
      return;
    }

    const additions = templates.filter((template) => !files.some((file) => file.path === template.path));
    const nextFiles = [...files, ...additions];
    setFiles(nextFiles);
    setSelectedIndex(Math.max(0, nextFiles.findIndex((file) => file.path === "src/App.tsx")));
    setError("");
    setMessage(additions.length ? "React TypeScript starter added. Edit src/App.tsx and press Run to type-check and execute it." : "The React TypeScript starter entry files already exist.");
    showToast("success", "React TypeScript starter added.");
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
    let response;
    try {
      response = await fetch(url, {
        method,
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch (reason) {
      if (reason?.name === "AbortError") {
        throw new Error("The request was cancelled before the server finished.");
      }
      throw new Error("The owner request could not reach the server. Check your connection and retry.");
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 504) {
        throw new Error(
          "The release build exceeded the server request limit. The existing published release was not switched. Retry the build; if it happens again, check the deployment's function duration and build logs.",
        );
      }
      throw new Error(payload?.error?.message || "The request could not be completed (HTTP " + response.status + ").");
    }
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

  async function deleteProject() {
    if (deleteConfirmation.trim() !== source.slug) {
      showToast("error", "Enter the exact project slug to confirm deletion.");
      return;
    }

    setBusy("delete");
    try {
      const response = await fetch(
        "/api/v1/admin/labs/experiments/" + encodeURIComponent(source.slug),
        {
          method: "DELETE",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ confirmSlug: deleteConfirmation.trim() }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.data?.deleted !== true) {
        throw new Error(payload?.error?.message || "The experiment could not be deleted.");
      }

      setConfirmDelete(false);
      showToast("success", "Experiment and its private assets were deleted.");
      router.push("/admin/labs/sources");
      router.refresh();
    } catch (reason) {
      showToast("error", reason.message || "The experiment could not be deleted.");
      setError(reason.message || "The experiment could not be deleted.");
    } finally {
      setBusy("");
    }
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
      showToast("success", data.version + " saved as a private draft.");
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
      showToast("error", reason.message || "The draft could not be saved.");
    } finally {
      setBusy("");
    }
  }

  async function publishDraft() {
    if (busy) return;

    const validationError = validateDraftFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    let versionId = source.draftVersionId || null;
    let savedDraft = null;

    setBusy("publish");
    setError("");
    setMessage("");
    setPublishStage("");

    try {
      // The primary action is safe for dirty editor state: snapshot the exact
      // current files first, then build and publish that immutable version.
      if (source.isCustom && (hasUnsavedChanges || !versionId)) {
        setPublishStage("Saving the current editor changes as a private draft…");
        savedDraft = await requestJson(
          "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/versions",
          "POST",
          {
            files,
            expectedDraftVersionId: source.draftVersionId || null,
            changeSummary,
            requestId: makeRequestId(),
          },
        );
        versionId = savedDraft.versionId;

        setSource((current) => ({
          ...current,
          draftVersionId: versionId,
          draft: {
            versionId,
            version: savedDraft.version,
            contentHash: savedDraft.contentHash,
          },
          files,
        }));
        setChangeSummary("");
        setMessage(savedDraft.version + " saved. Preparing the release build…");

        try {
          const nextVersions = await requestJson(
            "/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/versions",
          );
          setVersions(nextVersions || []);
        } catch {
          // Version history refresh is secondary; the new draft is already saved.
        }
      }

      if (!versionId) {
        throw new Error("There is no saved draft to publish. Add source files and try again.");
      }

      setPublishStage(
        source.isCustom
          ? "Building the saved version, uploading its immutable artifact and publishing…"
          : "Publishing the saved source version…",
      );

      const publishResult = await requestJson(
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
        draftVersionId: versionId,
        draft: savedDraft
          ? {
              versionId,
              version: savedDraft.version,
              contentHash: savedDraft.contentHash,
            }
          : current.draft,
        files,
        published: true,
        publishedVersionId: publishResult.publishedVersionId || versionId,
        publishedArtifact: publishResult.artifact || null,
      }));
      setConfirmPublish(false);
      setError("");
      setMessage(
        source.isCustom
          ? "Release built and published. The public Labs page now runs this exact immutable artifact."
          : "Source published. Every verified account can now access this version.",
      );
      showToast(
        "success",
        source.isCustom ? "Release built and published successfully." : "Source published successfully.",
      );

      try {
        const [nextVersions] = await Promise.all([
          requestJson("/api/v1/admin/labs/sources/" + encodeURIComponent(source.slug) + "/versions"),
          refreshAudit(),
        ]);
        setVersions(nextVersions || []);
      } catch {
        setMessage("The source was published. The history panel could not refresh; reload the page to see the latest activity.");
      }
    } catch (reason) {
      const failureMessage = reason.message || "Source could not be published.";
      if (savedDraft) {
        setMessage(
          savedDraft.version +
            " was saved as a private draft, but its release was not published. Fix the issue and retry Build & publish.",
        );
      }
      setError(failureMessage);
      showToast("error", failureMessage);
    } finally {
      setBusy("");
      setPublishStage("");
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
        publishedArtifact: null,
      }));
      setConfirmUnpublish(false);
      setMessage("Source unpublished. New source requests are now blocked.");
      showToast("success", "Source unpublished. New source requests are blocked.");
      try {
        await refreshAudit();
      } catch {
        setMessage("Source was unpublished. The audit timeline could not refresh; reload the page to see the latest activity.");
      }
    } catch (reason) {
      setError(reason.message || "Source could not be unpublished.");
      showToast("error", reason.message || "Source could not be unpublished.");
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
      showToast("success", versionLabel + " restored as a new draft.");
      try {
        await refreshSource();
      } catch {
        setMessage(versionLabel + " was restored. Reload the workspace to refresh the source and version history.");
      }
    } catch (reason) {
      setError(reason.message || "The selected version could not be restored.");
      showToast("error", reason.message || "The selected version could not be restored.");
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
              <>
                <span className="inline-flex h-9 items-center border border-border px-3 text-xs text-text-tertiary">
                  Private experiment draft
                </span>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmation(""); setConfirmDelete(true); }}
                  disabled={Boolean(busy)}
                  className="inline-flex h-9 items-center gap-2 border border-warning/50 px-3 text-xs font-semibold text-warning transition-colors hover:bg-warning/10 disabled:opacity-40"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Delete project
                </button>
              </>
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

        <section className={[
          "mt-6 grid gap-5",
          source.isCustom
            ? "xl:grid-cols-[240px_minmax(0,1.2fr)_minmax(340px,0.9fr)]"
            : "xl:grid-cols-[280px_minmax(0,1fr)]",
        ].join(" ")}>
          <aside className="rounded-sm border border-border bg-surface-1 p-4">
            <div className="flex flex-col items-stretch gap-3">
              <div>
                <h2 className="text-sm font-semibold">Files</h2>
                <p className="mt-1 text-[10px] text-text-tertiary">Drag to reorder or use the arrow controls.</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
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
                {files.length === 0 ? (
                  <>
                    <button type="button" onClick={createHtmlStarter} className="inline-flex h-8 items-center gap-1 border border-brand/40 px-2 text-[11px] font-semibold text-brand hover:bg-brand-soft">
                      HTML/CSS
                    </button>
                    <button type="button" onClick={createReactStarter} className="inline-flex h-8 items-center gap-1 border border-brand/40 px-2 text-[11px] font-semibold text-brand hover:bg-brand-soft">
                      React JS
                    </button>
                    <button type="button" onClick={createReactTsStarter} className="inline-flex h-8 items-center gap-1 border border-brand/40 px-2 text-[11px] font-semibold text-brand hover:bg-brand-soft">
                      React TSX
                    </button>
                  </>
                ) : null}
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
                      {String(new TextEncoder().encode(selectedFile.content || "").length)} bytes · {(selectedFile.content || "").split("\n").length} lines
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold">Release readiness</p>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">Run checks the current working copy. Publishing rebuilds the exact saved version, stores its immutable HTML/JS/CSS artifact and switches the public Labs page only after the build succeeds.</p>
                    {source.published && source.publishedArtifact ? (
                      <p className="mt-2 break-all text-[10px] text-brand">Live build · {source.publishedArtifact.buildHash}</p>
                    ) : null}
                  </div>
                  <span className={[
                    "inline-flex h-8 items-center gap-1.5 border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                    source.published && source.publishedArtifact
                      ? "border-brand/40 bg-brand-soft text-brand"
                      : "border-warning/40 bg-warning/10 text-warning",
                  ].join(" ")}>
                    <Eye size={12} aria-hidden="true" />
                    {source.published && source.publishedArtifact ? "Live release" : "Private draft"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="border border-brand/30 bg-brand-soft/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">Supported runtime</p>
                    <p className="mt-1 text-[11px] leading-5 text-text-secondary">React 19 · JSX/TSX · Motion · Tailwind CSS v4 · Lucide + React Icons</p>
                  </div>
                  <div className="border border-border bg-background p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Release safety</p>
                    <p className="mt-1 text-[11px] leading-5 text-text-secondary">No user package installs or build scripts. The previous published release remains live if a build fails.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setError(""); setConfirmPublish(true); }}
                  disabled={Boolean(busy) || !files.length}
                  className="mt-4 inline-flex h-9 items-center gap-2 border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-40"
                  title={hasUnsavedChanges || !source.draftVersionId ? "Save the current editor files, then build and publish them." : "Build and publish the current saved draft."}
                >
                  <Upload size={13} aria-hidden="true" />
                  Build &amp; publish release
                </button>
                {hasUnsavedChanges || !source.draftVersionId ? (
                  <p className="mt-2 text-[10px] text-text-tertiary">Your current editor files will be saved as a private version before the release build starts.</p>
                ) : null}
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

            {source.published ? (
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
          {source.isCustom ? <LabSourceLivePreview slug={source.slug} files={files} /> : null}
        </section>

        {source.isCustom ? <LabMediaLibrary slug={source.slug} /> : null}

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
                    {version.fileCount} files · {version.changeSummary || "No summary"} · {formatTimestamp(version.createdAt, "Unknown date")}
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
                  {formatTimestamp(event.createdAt, "Unknown time")}
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
            <h2 id="publish-title" className="text-base font-semibold">
              {source.isCustom ? "Build and publish this release?" : "Publish this source version?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {source.isCustom
                ? hasUnsavedChanges || !source.draftVersionId
                  ? "Your current editor files will first be saved as a private draft, then compiled in the isolated React toolchain. The immutable artifact and its screenshot will be stored before the public Labs page is switched. The current live release stays active if any step fails."
                  : "The saved draft will be compiled in the isolated React toolchain. Its immutable runtime artifact and screenshot will be stored before the public Labs page is switched. The current live release stays active if the build fails."
                : "This will make " + (source.draft?.version || "the saved draft") + " available to every account with a verified email. Anonymous visitors will still not be able to view the code."}
            </p>
            {busy === "publish" && publishStage ? (
              <div className="mt-4 flex items-start gap-2 border border-brand/30 bg-brand-soft/20 px-3 py-3" role="status" aria-live="polite">
                <LoaderCircle size={15} className="mt-0.5 shrink-0 animate-spin text-brand" aria-hidden="true" />
                <p className="text-xs leading-5 text-text-secondary">{publishStage}</p>
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 border border-warning/40 bg-warning/10 px-3 py-3" role="alert">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-warning">Build & publish failed</p>
                <p className="mt-1 break-words text-xs leading-5 text-text-secondary">{error}</p>
              </div>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmPublish(false)}
                disabled={Boolean(busy)}
                className="h-9 border border-border px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={publishDraft}
                disabled={Boolean(busy) || !files.length}
                aria-busy={busy === "publish"}
                className="inline-flex h-9 items-center gap-2 bg-brand px-3 text-xs font-semibold text-brand-contrast disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "publish" ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Upload size={13} aria-hidden="true" />}
                {busy === "publish"
                  ? (source.isCustom ? "Building & publishing…" : "Publishing…")
                  : (source.isCustom ? "Build & publish" : "Confirm publish")}
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
      {confirmDelete ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-project-title" className="w-full max-w-md border border-warning/40 bg-surface-1 p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-warning">
              <Trash2 size={16} aria-hidden="true" />
              <h2 id="delete-project-title" className="text-base font-semibold">Delete this experiment?</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              This permanently deletes the custom experiment, source versions, private media, release artifacts and engagement records. Its public page is hidden before cleanup begins. This action cannot be undone.
            </p>
            <label className="mt-4 block text-xs font-medium text-text-secondary">
              Type <span className="font-mono text-text-primary">{source.slug}</span> to confirm
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="mt-2 h-10 w-full border border-border bg-background px-3 font-mono text-xs text-text-primary outline-none focus:border-warning"
                placeholder={source.slug}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy === "delete"} className="h-9 border border-border px-3 text-xs">Cancel</button>
              <button
                type="button"
                onClick={deleteProject}
                disabled={busy === "delete" || deleteConfirmation.trim() !== source.slug}
                className="inline-flex h-9 items-center gap-2 border border-warning bg-warning/10 px-3 text-xs font-semibold text-warning disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === "delete" ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}
                {busy === "delete" ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

    </main>
  );
}
