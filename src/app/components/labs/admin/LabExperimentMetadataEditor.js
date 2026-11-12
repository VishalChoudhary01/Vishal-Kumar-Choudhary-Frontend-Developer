"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SaveIcon as AnimatedSave } from "@animateicons/react/lucide/save-icon";
import { ArrowLeftIcon as AnimatedArrowLeft } from "@animateicons/react/lucide/arrow-left-icon";

import { LAB_CATEGORIES } from "@/app/data/labsExperiments";
import { useActionToast } from "@/app/providers/ActionToastProvider";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const inputClass = "mt-1 h-10 w-full rounded-[2px] border border-border bg-background px-3 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
const textAreaClass = "mt-1 w-full resize-y rounded-[2px] border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
const labelClass = "block text-xs font-medium text-text-secondary";

function toFormValues(experiment) {
  return {
    title: experiment.title || "",
    description: experiment.description || "",
    explanation: experiment.explanation || "",
    category: experiment.category || LAB_CATEGORIES[0]?.name || "",
    technologies: Array.isArray(experiment.technologies)
      ? experiment.technologies.join(", ")
      : "",
  };
}

export default function LabExperimentMetadataEditor({ initialExperiment }) {
  const prefersReducedMotion = useReducedMotion();
  const sourceWorkspaceIconRef = useRef(null);
  const saveIconRef = useRef(null);
  const router = useRouter();
  const { showToast } = useActionToast();
  const [form, setForm] = useState(() => toFormValues(initialExperiment));
  const [savedForm, setSavedForm] = useState(() => toFormValues(initialExperiment));
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initialExperiment.updatedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
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

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function confirmNavigation(event) {
    if (
      hasUnsavedChanges &&
      !window.confirm("Discard your unsaved experiment detail changes?")
    ) {
      event.preventDefault();
    }
  }

  async function saveDetails(event) {
    event.preventDefault();
    if (!hasUnsavedChanges || busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        "/api/v1/admin/labs/experiments/" + encodeURIComponent(initialExperiment.slug),
        {
          method: "PATCH",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            explanation: form.explanation,
            category: form.category,
            technologies: form.technologies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            expectedUpdatedAt,
          }),
        },
      );

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.data?.updatedAt) {
        throw new Error(payload?.error?.message || "Experiment details could not be saved.");
      }

      const nextForm = toFormValues(payload.data);
      setForm(nextForm);
      setSavedForm(nextForm);
      setExpectedUpdatedAt(payload.data.updatedAt);
      showToast("success", "Experiment details saved.");
      router.refresh();
    } catch (reason) {
      setError(reason.message || "Experiment details could not be saved.");
      showToast("error", reason.message || "Experiment details could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={saveDetails}
      className="mt-6 space-y-5 rounded-[3px] border border-border bg-surface-1 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-tertiary">
            Canonical experiment slug
          </p>
          <p className="mt-1 truncate font-mono text-xs text-text-secondary">
            {initialExperiment.slug}
          </p>
        </div>
        <span className="inline-flex h-7 items-center rounded-[2px] border border-border px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          {initialExperiment.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      <label className={labelClass}>
        Experiment title
        <input
          required
          maxLength={100}
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          disabled={busy}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Short description
        <textarea
          required
          maxLength={500}
          rows={3}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          disabled={busy}
          className={textAreaClass}
        />
        <span className="mt-1 block text-[10px] font-normal text-text-tertiary">
          {form.description.length} / 500 characters
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Category
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            disabled={busy}
            className={inputClass}
          >
            {LAB_CATEGORIES.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Technologies
          <input
            value={form.technologies}
            onChange={(event) => updateField("technologies", event.target.value)}
            placeholder="React, Motion, CSS"
            disabled={busy}
            className={inputClass}
          />
          <span className="mt-1 block text-[10px] font-normal text-text-tertiary">
            Separate technologies with commas. Maximum eight.
          </span>
        </label>
      </div>

      <label className={labelClass}>
        Detailed explanation
        <span className="font-normal text-text-tertiary"> (optional)</span>
        <textarea
          maxLength={2000}
          rows={5}
          value={form.explanation}
          onChange={(event) => updateField("explanation", event.target.value)}
          disabled={busy}
          placeholder="Explain the interaction, implementation or concepts…"
          className={textAreaClass}
        />
        <span className="mt-1 block text-[10px] font-normal text-text-tertiary">
          {form.explanation.length} / 2,000 characters
        </span>
      </label>

      <div className="rounded-[2px] border border-info/30 bg-info/5 px-3 py-3 text-xs leading-5 text-text-secondary">
        This form updates experiment catalogue details only. Source files, saved source versions, published source pointers and runtime artifacts are not changed by this action.
      </div>

      {error ? (
        <p role="alert" className="rounded-[2px] border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Link
          href={"/admin/labs/sources/" + encodeURIComponent(initialExperiment.slug)}
          onClick={confirmNavigation}
          onMouseEnter={() => sourceWorkspaceIconRef.current?.startAnimation?.()}
          onMouseLeave={() => sourceWorkspaceIconRef.current?.stopAnimation?.()}
          onFocus={() => sourceWorkspaceIconRef.current?.startAnimation?.()}
          onBlur={() => sourceWorkspaceIconRef.current?.stopAnimation?.()}
          className="inline-flex h-9 items-center gap-2 rounded-[2px] text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
        >
          <AnimatedArrowLeft ref={sourceWorkspaceIconRef} size={13} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
          Source workspace
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/labs/sources"
            onClick={confirmNavigation}
            className="inline-flex h-9 items-center rounded-[2px] border border-border px-3 text-xs font-medium text-text-secondary transition-[color,background-color,border-color] duration-200 hover:border-brand/45 hover:bg-surface-2 hover:text-brand motion-reduce:transition-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            onMouseEnter={() => saveIconRef.current?.startAnimation?.()}
            onMouseLeave={() => saveIconRef.current?.stopAnimation?.()}
            onFocus={() => saveIconRef.current?.startAnimation?.()}
            onBlur={() => saveIconRef.current?.stopAnimation?.()}
            disabled={busy || !hasUnsavedChanges}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-brand px-4 text-xs font-semibold text-brand-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-sm active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {busy ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <AnimatedSave ref={saveIconRef} size={14} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />
            )}
            {busy ? "Saving…" : "Save details"}
          </button>
        </div>
      </div>
    </form>
  );
}
