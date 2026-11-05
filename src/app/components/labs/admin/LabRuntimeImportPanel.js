"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FolderPlus, LoaderCircle } from "lucide-react";

const demos = [
  ["magnetic-interaction", "Magnetic Interaction"],
  ["scroll-driven-text-reveal", "Scroll-driven Text Reveal"],
  ["gradient-bloom", "Gradient Bloom"],
  ["generative-particle-field", "Generative Particle Field"],
];

export default function LabRuntimeImportPanel() {
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
      <section className="border border-border bg-surface-1 p-5">
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
            disabled={Boolean(busy)}
            className="inline-flex h-9 items-center gap-2 border border-brand/50 bg-brand-soft px-3 text-xs font-semibold text-brand disabled:opacity-50"
          >
            {busy === "runtimes" ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={14} aria-hidden="true" />
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
                  <Link className="text-brand underline" href={"/admin/labs/sources/" + slug}>
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

      <section className="border border-brand/30 bg-surface-1 p-5">
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
            disabled={Boolean(busy)}
            className="inline-flex h-9 shrink-0 items-center gap-2 bg-brand px-3 text-xs font-semibold text-brand-contrast disabled:opacity-50"
          >
            {busy === "magnetic-button" ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <FolderPlus size={14} aria-hidden="true" />
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
              className="inline-flex h-9 items-center border border-brand/40 px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
            >
              Open MagneticButton source
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
