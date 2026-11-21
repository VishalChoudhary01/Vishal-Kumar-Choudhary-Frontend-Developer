"use client";

import { useEffect, useRef, useState } from "react";
import {
  Code2,
  Folder,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
} from "lucide-react";
import styles from "./LabResizableWorkspace.module.css";

const STORAGE_KEY = "labs-source-workspace-layout:v1";
const DEFAULT_LAYOUT = {
  filesWidth: 248,
  previewWidth: 420,
  filesVisible: true,
  previewVisible: true,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function normalizeLayout(value) {
  if (!value || typeof value !== "object") return DEFAULT_LAYOUT;
  return {
    filesWidth: clamp(Number(value.filesWidth) || DEFAULT_LAYOUT.filesWidth, 180, 420),
    previewWidth: clamp(Number(value.previewWidth) || DEFAULT_LAYOUT.previewWidth, 320, 760),
    filesVisible: value.filesVisible !== false,
    previewVisible: value.previewVisible !== false,
  };
}

function toolButtonClass(active = false) {
  return [
    "inline-flex h-8 items-center gap-1.5 rounded-[2px] border px-2.5 text-[10px] font-semibold transition-[color,background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none",
    active
      ? "border-brand/45 bg-brand-soft/45 text-brand"
      : "border-border text-text-secondary hover:border-brand/35 hover:bg-surface-2 hover:text-text-primary",
  ].join(" ");
}

export default function LabResizableWorkspace({ files, editor, preview = null }) {
  const rootRef = useRef(null);
  const resizeRef = useRef(null);
  const layoutRef = useRef(DEFAULT_LAYOUT);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [hydrated, setHydrated] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("editor");
  const hasPreview = Boolean(preview);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const normalized = normalizeLayout(JSON.parse(saved));
        layoutRef.current = normalized;
        setLayout(normalized);
      }
    } catch {
      // Invalid or unavailable local storage must never block the editor.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    layoutRef.current = layout;
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // The workspace still works when storage is unavailable or full.
    }
  }, [hydrated, layout]);

  function applyTrack(side, width) {
    const property = side === "files" ? "--files-track" : "--preview-track";
    rootRef.current?.style.setProperty(property, width + "px");
  }

  function commitWidth(side, width) {
    const current = layoutRef.current;
    const next = {
      ...current,
      [side === "files" ? "filesWidth" : "previewWidth"]: width,
    };
    layoutRef.current = next;
    setLayout(next);
  }

  function beginResize(side, event) {
    if (event.button !== 0 || focusedPanel) return;
    event.preventDefault();
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds) return;
    resizeRef.current = {
      side,
      startX: event.clientX,
      startWidth: side === "files" ? layoutRef.current.filesWidth : layoutRef.current.previewWidth,
      nextWidth: side === "files" ? layoutRef.current.filesWidth : layoutRef.current.previewWidth,
      workspaceWidth: bounds.width,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveResize(event) {
    const drag = resizeRef.current;
    if (!drag) return;
    const delta = event.clientX - drag.startX;
    const current = layoutRef.current;
    const desktopFilesColumn = typeof window !== "undefined" && window.innerWidth >= 1280 && current.filesVisible;
    const minEditorWidth = 380;
    const reserved = minEditorWidth + 16 + (desktopFilesColumn && drag.side === "preview" ? current.filesWidth : 0);
    const maxWidth = drag.side === "files"
      ? Math.min(420, drag.workspaceWidth - current.previewWidth - minEditorWidth - 16)
      : Math.min(760, drag.workspaceWidth - reserved);
    const minWidth = drag.side === "files" ? 180 : 320;
    const nextWidth = clamp(
      drag.side === "files" ? drag.startWidth + delta : drag.startWidth - delta,
      minWidth,
      maxWidth,
    );
    drag.nextWidth = nextWidth;
    applyTrack(drag.side, nextWidth);
  }

  function endResize() {
    const drag = resizeRef.current;
    if (!drag) return;
    resizeRef.current = null;
    commitWidth(drag.side, drag.nextWidth);
  }

  function resizeWithKeyboard(side, event) {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 48 : 16;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const current = layoutRef.current;
    const widthKey = side === "files" ? "filesWidth" : "previewWidth";
    const nextWidth = clamp(
      current[widthKey] + (side === "files" ? direction : -direction) * step,
      side === "files" ? 180 : 320,
      side === "files" ? 420 : 760,
    );
    applyTrack(side, nextWidth);
    commitWidth(side, nextWidth);
  }

  function toggleFiles() {
    setFocusedPanel(null);
    setLayout((current) => ({ ...current, filesVisible: !current.filesVisible }));
  }

  function togglePreview() {
    if (!hasPreview) return;
    setFocusedPanel(null);
    setLayout((current) => ({ ...current, previewVisible: !current.previewVisible }));
  }

  function focusPanel(panel) {
    setFocusedPanel((current) => current === panel ? null : panel);
  }

  function resetLayout() {
    layoutRef.current = DEFAULT_LAYOUT;
    setLayout(DEFAULT_LAYOUT);
    setFocusedPanel(null);
    rootRef.current?.style.setProperty("--files-track", DEFAULT_LAYOUT.filesWidth + "px");
    rootRef.current?.style.setProperty("--preview-track", DEFAULT_LAYOUT.previewWidth + "px");
  }

  const activeLayout = focusedPanel || "all";

  return (
    <section className={styles.shell} aria-label="Resizable Labs source workspace">
      <div className={styles.toolbar}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Workspace</span>
          <span className="hidden text-[10px] text-text-tertiary sm:inline">Resize panels or focus a workspace area</span>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" onClick={toggleFiles} aria-pressed={layout.filesVisible} title={layout.filesVisible ? "Collapse files panel" : "Show files panel"} className={toolButtonClass(layout.filesVisible)}>
            {layout.filesVisible ? <PanelLeftClose size={13} aria-hidden="true" /> : <PanelLeftOpen size={13} aria-hidden="true" />}
            Files
          </button>
          <button type="button" onClick={() => focusPanel("editor")} aria-pressed={focusedPanel === "editor"} title="Focus source editor" className={toolButtonClass(focusedPanel === "editor")}>
            <Code2 size={13} aria-hidden="true" />
            Focus editor
          </button>
          {hasPreview ? (
            <button type="button" onClick={togglePreview} aria-pressed={layout.previewVisible} title={layout.previewVisible ? "Collapse preview panel" : "Show preview panel"} className={toolButtonClass(layout.previewVisible)}>
              {layout.previewVisible ? <PanelRightClose size={13} aria-hidden="true" /> : <PanelRightOpen size={13} aria-hidden="true" />}
              Preview
            </button>
          ) : null}
          <button type="button" onClick={resetLayout} title="Reset panel sizes and visibility" className={toolButtonClass(false)}>
            <RotateCcw size={12} aria-hidden="true" />
            Reset
          </button>
        </div>
        <button type="button" onClick={resetLayout} className={styles.mobileReset} title="Reset workspace layout">
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className={styles.mobileTabs} role="tablist" aria-label="Workspace panels">
        <button type="button" role="tab" aria-selected={mobilePanel === "files"} onClick={() => setMobilePanel("files")} className={mobilePanel === "files" ? styles.mobileTabActive : styles.mobileTab}>
          <Folder size={14} aria-hidden="true" /> Files
        </button>
        <button type="button" role="tab" aria-selected={mobilePanel === "editor"} onClick={() => setMobilePanel("editor")} className={mobilePanel === "editor" ? styles.mobileTabActive : styles.mobileTab}>
          <Code2 size={14} aria-hidden="true" /> Editor
        </button>
        {hasPreview ? (
          <button type="button" role="tab" aria-selected={mobilePanel === "preview"} onClick={() => setMobilePanel("preview")} className={mobilePanel === "preview" ? styles.mobileTabActive : styles.mobileTab}>
            <Monitor size={14} aria-hidden="true" /> Preview
          </button>
        ) : null}
      </div>

      <div
        ref={rootRef}
        className={styles.workspace}
        data-focus={activeLayout}
        data-files-visible={layout.filesVisible ? "true" : "false"}
        data-preview-visible={layout.previewVisible && hasPreview ? "true" : "false"}
        data-mobile-active={mobilePanel}
        data-has-preview={hasPreview ? "true" : "false"}
        style={{
          "--files-track": layout.filesWidth + "px",
          "--preview-track": layout.previewWidth + "px",
        }}
      >
        <button
          type="button"
          className={styles.drawerBackdrop}
          aria-label="Close files drawer"
          tabIndex={-1}
          onClick={() => setLayout((current) => ({ ...current, filesVisible: false }))}
        />

        <div className={[styles.pane, styles.filesPane].join(" ")}>{files}</div>

        <div
          className={[styles.resizeHandle, styles.filesResize].join(" ")}
          role="separator"
          aria-label="Resize files panel"
          aria-orientation="vertical"
          aria-valuemin={180}
          aria-valuemax={420}
          aria-valuenow={layout.filesWidth}
          aria-valuetext={layout.filesWidth + " pixels"}
          tabIndex={0}
          onPointerDown={(event) => beginResize("files", event)}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onKeyDown={(event) => resizeWithKeyboard("files", event)}
        />

        <div className={[styles.pane, styles.editorPane].join(" ")}>{editor}</div>

        {hasPreview ? (
          <>
            <div
              className={[styles.resizeHandle, styles.previewResize].join(" ")}
              role="separator"
              aria-label="Resize live preview panel"
              aria-orientation="vertical"
              aria-valuemin={320}
              aria-valuemax={760}
              aria-valuenow={layout.previewWidth}
              aria-valuetext={layout.previewWidth + " pixels"}
              tabIndex={0}
              onPointerDown={(event) => beginResize("preview", event)}
              onPointerMove={moveResize}
              onPointerUp={endResize}
              onPointerCancel={endResize}
              onKeyDown={(event) => resizeWithKeyboard("preview", event)}
            />
            <div className={[styles.pane, styles.previewPane].join(" ")}>{preview}</div>
          </>
        ) : null}
      </div>
    </section>
  );
}
