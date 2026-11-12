"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { DownloadIcon as AnimatedDownload } from "@animateicons/react/lucide/download-icon";
import { FolderPlusIcon as AnimatedFolderPlus } from "@animateicons/react/lucide/folder-plus-icon";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const demos = [
  ["magnetic-interaction", "Magnetic Interaction"],
  ["scroll-driven-text-reveal", "Scroll-driven Text Reveal"],
  ["gradient-bloom", "Gradient Bloom"],
  ["generative-particle-field", "Generative Particle Field"],
];

export default function LabRuntimeImportPanel() {
  const prefersReducedMotion = useReducedMotion();
  const componentIconRef = useRef(null);
  const downloadIconRef = useRef(null);
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [componentResult, setComponentResult] = useState(null);
  const [componentError, setComponentError] = useState("");

  async function importAll() {
    if (
      !window.confirm(
        "Import the reviewed runtime source for all four demos? Existing drafts are skipped; published source is unchanged.",
      )
    ) {
      return;
    }

    setBusy("runtimes");
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/v1/admin/labs/sources/import-runtime", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: "{}",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message || "Runtime import failed.");
      }
      setResult(payload.data);
    } catch (reason) {
      setError(reason.message || "Runtime import failed.");
    } finally {
      setBusy("");
    }
  }

  async function importMagneticButton() {
    if (
      !window.confirm(
        "Add a separate private MagneticButton Component workspace with runnable React source files? Existing drafts will be preserved and nothing will be published.",
      )
    ) {
      return;
    }

    setBusy("magnetic-button");
    setComponentError("");
    setComponentResult(null);

    try {
      const response = await fetch(
        "/api/v1/admin/labs/sources/import-magnetic-button",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: "{}",
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload?.data?.workspaceUrl) {
        throw new Error(payload?.error?.message || "MagneticButton import failed.");
      }
      setComponentResult(payload.data);
    } catch (reason) {
      setComponentError(reason.message || "MagneticButton import failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-[3px] border border-border bg-surface-1 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Initialize built-in experiment sources</h2>
            <p className="mt-1 text-xs text-text-tertiary">
              Import actual runtime files as private drafts. Nothing is published automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={importAll}
            onMouseEnter={() => downloadIconRef.current?.startAnimation?.()}
            onMouseLeave={() => downloadIconRef.current?.stopAnimation?.()}
            onFocus={() => downloadIconRef.current?.startAnimation?.()}
            onBlur={() => downloadIconRef.current?.stopAnimation?.()}
            disabled={Boolean(busy)}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-brand/40 bg-brand-soft px-3 text-xs font-semibold text-brand transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand/65 hover:bg-brand/10 active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {busy === "runtimes" ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <AnimatedDownload ref={downloadIconRef} size={14} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />
            )}
            {busy === "runtimes" ? "Importing…" : "Import four runtime sources"}
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-xs text-warning">{error}</p>
        ) : null}

        {result ? (
          <div role="status" className="mt-4 border-t border-border pt-3 text-xs">
            <p>
              {result.imported.length} imported · {result.skipped.length} existing drafts preserved · {result.failed.length} failed
            </p>
            {[...result.imported, ...result.skipped, ...result.failed].map((item) => {
              const slug = typeof item === "string" ? item : item.slug;
              const demo = demos.find(([id]) => id === slug);
              return (
                <p key={slug} className="mt-2">
                  <Link className="rounded-[2px] text-brand underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={"/admin/labs/sources/" + slug}>
                    {demo?.[1] || slug}
                  </Link>
                  {" — "}
                  {typeof item === "string" ? "Draft already exists" : item.version || item.code}
                </p>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-[3px] border border-brand/30 bg-surface-1 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-2xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-brand">
              Reusable component source
            </p>
            <h2 className="mt-2 text-sm font-semibold">MagneticButton Component</h2>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Create a separate private Source Management workspace containing the reusable component,
              its pointer-physics helper, a runnable React demonstration and editable component props.
              This does not replace the existing published Magnetic Interaction experiment.
            </p>
          </div>
          <button
            type="button"
            onClick={importMagneticButton}
            onMouseEnter={() => componentIconRef.current?.startAnimation?.()}
            onMouseLeave={() => componentIconRef.current?.stopAnimation?.()}
            onFocus={() => componentIconRef.current?.startAnimation?.()}
            onBlur={() => componentIconRef.current?.stopAnimation?.()}
            disabled={Boolean(busy)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[2px] bg-brand px-3 text-xs font-semibold text-brand-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-sm active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {busy === "magnetic-button" ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <AnimatedFolderPlus ref={componentIconRef} size={14} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
            )}
            {busy === "magnetic-button" ? "Adding source…" : "Add to Source Management"}
          </button>
        </div>

        {componentError ? (
          <p role="alert" className="mt-3 text-xs text-warning">{componentError}</p>
        ) : null}

        {componentResult ? (
          <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs font-semibold text-text-primary">
                {componentResult.imported ? "Private source draft created." : "Existing draft preserved."}
              </p>
              <p className="mt-1 text-[11px] text-text-tertiary">
                {componentResult.version || "Open the workspace to inspect the current source."}
                {" · "}
                {componentResult.fileCount || "Existing"} files
                {" · "}
                Not published
              </p>
            </div>
            <Link
              href={componentResult.workspaceUrl}
              className="inline-flex h-9 items-center rounded-[2px] border border-brand/40 px-3 text-xs font-semibold text-brand transition-[color,background-color,border-color] duration-200 hover:border-brand/60 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
            >
              Open MagneticButton source
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
