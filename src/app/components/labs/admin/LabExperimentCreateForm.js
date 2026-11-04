"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { LAB_CATEGORIES } from "@/app/data/labsExperiments";

const inputClass = "mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-brand";
const labelClass = "block text-xs font-medium text-text-secondary";

export default function LabExperimentCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(LAB_CATEGORIES[0]?.name || "");
  const [technologies, setTechnologies] = useState("JavaScript, CSS");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/labs/experiments", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          category,
          explanation,
          technologies: technologies.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.data?.slug) {
        throw new Error(payload?.error?.message || "The experiment could not be created.");
      }
      router.push(payload.data.workspaceUrl);
      router.refresh();
    } catch (reason) {
      setError(reason.message || "The experiment could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/labs/sources" className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary">
          <ArrowLeft size={14} aria-hidden="true" />
          Source dashboard
        </Link>

        <header className="mt-8 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">OWNER EXPERIMENT STUDIO</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Create an experiment</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Start a private experiment workspace. Add your files and save source versions before any public release.
          </p>
        </header>

        <form onSubmit={submit} className="mt-6 space-y-5 border border-border bg-surface-1 p-5 sm:p-6">
          <label className={labelClass}>
            Experiment title
            <input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Fluid Gradient Playground" className={inputClass} />
          </label>

          <label className={labelClass}>
            URL slug <span className="font-normal text-text-tertiary">(optional; generated from title when empty)</span>
            <input maxLength={80} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="fluid-gradient-playground" className={inputClass} />
          </label>

          <label className={labelClass}>
            Short description
            <textarea required maxLength={500} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does this experiment demonstrate?" className="mt-1 w-full resize-y border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-brand" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                {LAB_CATEGORIES.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Technologies <span className="font-normal text-text-tertiary">(comma separated)</span>
              <input value={technologies} onChange={(event) => setTechnologies(event.target.value)} placeholder="JavaScript, CSS, Motion" className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>
            Detailed explanation <span className="font-normal text-text-tertiary">(optional)</span>
            <textarea maxLength={2000} rows={4} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Explain the interaction, implementation or concepts…" className="mt-1 w-full resize-y border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-brand" />
          </label>

          {error ? <p role="alert" className="border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            <Link href="/admin/labs/sources" className="inline-flex h-9 items-center border border-border px-3 text-xs font-medium text-text-secondary">Cancel</Link>
            <button type="submit" disabled={busy} className="inline-flex h-9 items-center gap-2 bg-brand px-4 text-xs font-semibold text-brand-contrast disabled:opacity-50">
              {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
              {busy ? "Creating…" : "Create workspace"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
