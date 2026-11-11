"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionToast } from "@/app/providers/ActionToastProvider";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Clock3,
  LoaderCircle,
  SearchX,
} from "lucide-react";
import { SearchIcon as AnimatedSearch } from "@animateicons/react/lucide/search-icon";
import { TriangleAlertIcon as AlertTriangle } from "@animateicons/react/lucide/triangle-alert-icon";
import { CircleCheckIcon as CheckCircle2 } from "@animateicons/react/lucide/circle-check-icon";
import { FileCodeIcon as FileCode2 } from "@animateicons/react/lucide/file-code-icon";
import { FolderPlusIcon as FolderPlus } from "@animateicons/react/lucide/folder-plus-icon";
import { PencilIcon as Pencil } from "@animateicons/react/lucide/pencil-icon";
import { RefreshCwIcon as RefreshCw } from "@animateicons/react/lucide/refresh-cw-icon";
import { TrashIcon as AnimatedTrash } from "@animateicons/react/lucide/trash-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const FILTERS = [
  { value: "all", label: "All experiments" },
  { value: "missing", label: "No source" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "notGallery", label: "Not in gallery" },
];

function getSourceState(item) {
  if (item.lifecycleStatus === "deleting") return "deleting";
  if (!item.hasSource) return "missing";
  if (item.published) return "published";
  if (
    item.draftVersionId ||
    item.latestVersion ||
    item.versionCount > 0 ||
    (item.legacyVersion && item.legacyVersion !== "0.0")
  ) {
    return "draft";
  }
  return "setup";
}

function formatDate(value) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toISOString().slice(0, 19).replace("T", " ") + " UTC";
}

function StateLabel({ state }) {
  const config = {
    missing: {
      label: "Not created",
      className: "border-border bg-surface-2 text-text-tertiary",
    },
    setup: {
      label: "Needs files",
      className: "border-warning/40 bg-warning/10 text-warning",
    },
    draft: {
      label: "Draft saved",
      className: "border-border bg-surface-2 text-text-secondary",
    },
    published: {
      label: "Published",
      className: "border-brand/40 bg-brand-soft text-brand",
    },
    deleting: {
      label: "Cleanup pending",
      className: "border-warning/40 bg-warning/10 text-warning",
    },
    "not-in-gallery": {
      label: "Not in gallery",
      className: "border-warning/40 bg-warning/10 text-warning",
    },
  }[state];

  return (
    <span className={["inline-flex h-6 items-center border px-2 text-[10px] font-semibold", config.className].join(" ")}>
      {config.label}
    </span>
  );
}

export default function LabSourceInventory() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { showToast } = useActionToast();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const deleteModalIconRef = useRef(null);
  const deleteConfirmIconRef = useRef(null);
  const deleteRowIconRefs = useRef(new Map());
  const searchIconRef = useRef(null);
  const refreshIconRef = useRef(null);
  const createIconRef = useRef(null);
  const editIconRefs = useRef(new Map());
  const openIconRefs = useRef(new Map());

  const startSearchAnimation = () => searchIconRef.current?.startAnimation?.();
  const stopSearchAnimation = () => searchIconRef.current?.stopAnimation?.();

  useEffect(() => {
    if (deleteTarget) deleteModalIconRef.current?.startAnimation?.();
  }, [deleteTarget]);

  async function loadInventory({ quiet = false } = {}) {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/labs/sources", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(payload?.data)) {
        throw new Error(payload?.error?.message || "Source inventory is unavailable.");
      }
      setItems(payload.data);
    } catch (reason) {
      setError(reason.message || "Source inventory is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    fetch("/api/v1/admin/labs/sources", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.error?.message || "Source inventory is unavailable.");
        }
        return payload.data;
      })
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((reason) => {
        if (active) setError(reason.message || "Source inventory is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    return items.reduce(
      (result, item) => {
        result.total += 1;
        result[getSourceState(item)] += 1;
        if (item.isCustom && item.publicationReadiness?.eligible !== true) {
          result.notInGallery += 1;
        }
        return result;
      },
      { total: 0, missing: 0, setup: 0, draft: 0, published: 0, deleting: 0, notInGallery: 0 },
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const state = getSourceState(item);
      const matchesState =
        filter === "all" ||
        (filter === "missing" && state === "missing") ||
        (filter === "draft" && (state === "draft" || state === "setup")) ||
        (filter === "published" && state === "published") ||
        (filter === "notGallery" && item.isCustom && item.publicationReadiness?.eligible !== true);
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.slug, item.description].some((value) =>
          String(value || "").toLowerCase().includes(normalizedQuery),
        );
      return matchesState && matchesQuery;
    });
  }, [items, query, filter]);

  async function createSource(slug) {
    setCreating(slug);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/labs/sources", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) {
          await loadInventory({ quiet: true });
        }
        throw new Error(
          payload?.error?.message ||
            (response.status === 409
              ? "A source workspace already exists. The inventory has been refreshed."
              : "Could not create source."),
        );
      }

      if (payload?.data?.slug !== slug) {
        throw new Error("The server did not confirm the requested source workspace.");
      }

      showToast("success", "Source workspace created. Opening the editor…");
      router.push("/admin/labs/sources/" + encodeURIComponent(payload.data.slug));
    } catch (reason) {
      setError(reason.message || "Could not create source.");
      showToast("error", reason.message || "Could not create source.");
    } finally {
      setCreating("");
    }
  }

  async function deleteExperiment() {
    if (!deleteTarget || deleteConfirmation.trim() !== deleteTarget.slug) {
      showToast("error", "Enter the exact experiment slug to confirm deletion.");
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch("/api/v1/admin/labs/experiments/" + encodeURIComponent(deleteTarget.slug), {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ confirmSlug: deleteConfirmation.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.data?.deleted !== true) {
        throw new Error(payload?.error?.message || "The experiment could not be deleted.");
      }
      setItems((current) => current.filter((item) => item.slug !== deleteTarget.slug));
      showToast("success", "Experiment, source history and associated assets deleted.");
      setDeleteTarget(null);
      setDeleteConfirmation("");
    } catch (reason) {
      setError(reason.message || "The experiment could not be deleted.");
      showToast("error", reason.message || "The experiment could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }
  return (
    <section aria-labelledby="source-inventory-title" className="mt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">SOURCE LIBRARY</p>
          <h2 id="source-inventory-title" className="mt-2 text-xl font-semibold tracking-tight">
            Experiment workspace
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
            Only owner-created experiments appear here. New gallery experiments stay private until their exact saved source version is successfully built and published.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/labs/experiments/new"
            onMouseEnter={() => createIconRef.current?.startAnimation?.()}
            onMouseLeave={() => createIconRef.current?.stopAnimation?.()}
            onFocus={() => createIconRef.current?.startAnimation?.()}
            onBlur={() => createIconRef.current?.stopAnimation?.()}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-brand px-3 text-xs font-semibold text-brand-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
          >
            <FolderPlus ref={createIconRef} size={14} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
            New gallery experiment
          </Link>
          <button
          type="button"
          onClick={() => loadInventory({ quiet: true })}
          onMouseEnter={() => refreshIconRef.current?.startAnimation?.()}
          onMouseLeave={() => refreshIconRef.current?.stopAnimation?.()}
          onFocus={() => refreshIconRef.current?.startAnimation?.()}
          onBlur={() => refreshIconRef.current?.stopAnimation?.()}
          disabled={loading || refreshing || Boolean(creating)}
          className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-medium text-text-secondary transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand/45 hover:bg-surface-2 hover:text-brand hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {refreshing ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw ref={refreshIconRef} size={14} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
          )}
          Refresh
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Experiments", value: counts.total },
          { label: "No source", value: counts.missing },
          { label: "Drafts", value: counts.draft + counts.setup },
          { label: "Published", value: counts.published },
          { label: "Custom not in gallery", value: counts.notInGallery },
          { label: "Cleanup pending", value: counts.deleting },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[3px] border border-border bg-surface-1 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
              {metric.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-[3px] border border-border bg-surface-1 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label
          className="group/search relative block min-w-0 flex-1"
          onMouseEnter={startSearchAnimation}
          onMouseLeave={stopSearchAnimation}
        >
          <span className="sr-only">Search experiments</span>
          <AnimatedSearch
            ref={searchIconRef}
            size={15}
            duration={0.68}
            isAnimated={!prefersReducedMotion}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within/search:text-brand"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={startSearchAnimation}
            onBlur={stopSearchAnimation}
            placeholder="Search by experiment name or slug"
            className="h-10 w-full rounded-[2px] border border-border bg-background pl-9 pr-3 text-xs text-text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand/15 motion-reduce:transition-none"
          />
        </label>
        <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-[3px] border border-border bg-surface-2/45 p-1" role="group" aria-label="Filter source inventory">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={[
                "inline-flex min-h-9 items-center justify-center rounded-[2px] border px-3 text-[11px] font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none",
                filter === option.value
                  ? "border-brand/40 bg-brand-soft text-brand shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-brand/15"
                  : "border-transparent text-text-secondary hover:-translate-y-0.5 hover:border-border hover:bg-surface-1 hover:text-text-primary hover:shadow-sm active:scale-[0.98]",
              ].join(" ")}
            >
              {option.label}
              {option.value === "all" ? " (" + counts.total + ")" : option.value === "missing" ? " (" + counts.missing + ")" : option.value === "draft" ? " (" + (counts.draft + counts.setup) + ")" : " (" + counts.published + ")"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-[2px] mt-4 flex flex-wrap items-center justify-between gap-3 border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => loadInventory()} className="font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 flex min-h-40 items-center justify-center gap-3 rounded-[3px] border border-border bg-surface-1 text-xs text-text-tertiary" role="status">
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          Loading source inventory…
        </div>
      ) : filteredItems.length ? (
        <div className="mt-4 divide-y divide-border rounded-[3px] border border-border bg-surface-1">
          {filteredItems.map((item) => {
            const state = getSourceState(item);
            const hasWorkspace = item.hasSource;
            return (
              <article key={item.slug} className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-2/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-border bg-background text-text-tertiary transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none">
                    {item.isCustom && item.publicationReadiness?.eligible !== true ? (
                      <AlertTriangle size={16} duration={0.68} isAnimated={!prefersReducedMotion} className="text-warning" aria-hidden="true" />
                    ) : state === "published" ? (
                      <CheckCircle2 size={16} duration={0.68} isAnimated={!prefersReducedMotion} className="text-brand" aria-hidden="true" />
                    ) : state === "missing" ? (
                      <FolderPlus size={16} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                    ) : (
                      <FileCode2 size={16} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-text-primary">{item.title}</h3>
                      {item.isCustom ? (
                        <span className="inline-flex h-6 items-center rounded-[2px] border border-brand/30 bg-brand/5 px-2 text-[10px] font-semibold text-brand">
                          OWNER CREATED
                        </span>
                      ) : null}
                      <StateLabel state={state} />
                      {item.isCustom && item.publicationReadiness?.eligible !== true && state !== "not-in-gallery" ? (
                        <StateLabel state="not-in-gallery" />
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-text-tertiary">{item.slug}</p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-text-secondary">{item.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-tertiary">
                      <span>{item.versionCount || 0} saved versions</span>
                      {item.latestVersion ? <span>Latest {item.latestVersion}</span> : null}
                      {item.isCustom ? (
                        <span
                          className={item.publicationReadiness?.eligible ? "font-semibold text-success" : "font-medium text-warning"}
                          title={item.publicationReadiness?.code || "GALLERY_READINESS_UNKNOWN"}
                        >
                          Gallery: {item.publicationReadiness?.label || "Eligibility unavailable"}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} aria-hidden="true" />
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                  {item.isCustom && item.lifecycleStatus !== "deleting" ? (
                    <Link
                      href={"/admin/labs/experiments/" + encodeURIComponent(item.slug) + "/edit"}
                      aria-label={"Edit details for " + item.title}
                      onMouseEnter={() => editIconRefs.current.get(item.slug)?.startAnimation?.()}
                      onMouseLeave={() => editIconRefs.current.get(item.slug)?.stopAnimation?.()}
                      onFocus={() => editIconRefs.current.get(item.slug)?.startAnimation?.()}
                      onBlur={() => editIconRefs.current.get(item.slug)?.stopAnimation?.()}
                      className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-semibold text-text-secondary transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:text-brand active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <Pencil ref={(node) => { if (node) editIconRefs.current.set(item.slug, node); else editIconRefs.current.delete(item.slug); }} size={13} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                      Edit details
                    </Link>
                  ) : null}
                  {hasWorkspace ? (
                    <>
                    <Link
                      href={"/admin/labs/sources/" + encodeURIComponent(item.slug)}
                      onMouseEnter={() => openIconRefs.current.get(item.slug)?.startAnimation?.()}
                      onMouseLeave={() => openIconRefs.current.get(item.slug)?.stopAnimation?.()}
                      onFocus={() => openIconRefs.current.get(item.slug)?.startAnimation?.()}
                      onBlur={() => openIconRefs.current.get(item.slug)?.stopAnimation?.()}
                      className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-border px-3 text-xs font-semibold text-text-secondary transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:text-brand active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <EyeIcon ref={(node) => { if (node) openIconRefs.current.set(item.slug, node); else openIconRefs.current.delete(item.slug); }} size={13} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                      {item.isCustom && item.publicationReadiness?.eligible !== true
                        ? "Continue to publish"
                        : "Open workspace"}
                    </Link>
                    {item.isCustom ? (
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(item); setDeleteConfirmation(""); }}
                        disabled={Boolean(creating) || deleting}
                        aria-label={"Delete " + item.title}
                        title="Delete custom experiment"
                        onMouseEnter={() => deleteRowIconRefs.current.get(item.slug)?.startAnimation?.()}
                        onMouseLeave={() => deleteRowIconRefs.current.get(item.slug)?.stopAnimation?.()}
                        onFocus={() => deleteRowIconRefs.current.get(item.slug)?.startAnimation?.()}
                        onBlur={() => deleteRowIconRefs.current.get(item.slug)?.stopAnimation?.()}
                        className="grid h-9 w-9 place-items-center rounded-[2px] border border-error/35 bg-error/[0.035] text-error transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-error/60 hover:bg-error/10 hover:shadow-sm active:translate-y-0 active:scale-[0.97] disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                      >
                        <AnimatedTrash
                          ref={(node) => {
                            if (node) deleteRowIconRefs.current.set(item.slug, node);
                            else deleteRowIconRefs.current.delete(item.slug);
                          }}
                          size={14}
                          duration={0.62}
                          isAnimated={!prefersReducedMotion}
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => createSource(item.slug)}
                      disabled={Boolean(creating)}
                      className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-brand px-3 text-xs font-semibold text-brand-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      {creating === item.slug ? (
                        <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <FolderPlus size={13} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                      )}
                      Create source
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-[3px] border border-dashed border-border bg-surface-1 px-5 text-center">
          <SearchX size={20} className="text-text-tertiary" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">No experiments match this view</p>
          <p className="mt-1 text-xs text-text-tertiary">Change the search or status filter to see more experiments.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-3 text-xs font-semibold text-brand hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
      {deleteTarget ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-delete-title"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-[4px] border border-error/25 bg-surface-1 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.5)] sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[3px] border border-error/30 bg-error/10 text-error shadow-sm">
                <AnimatedTrash ref={deleteModalIconRef} size={17} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-error">Permanent action</p>
                <h2 id="inventory-delete-title" className="mt-1 text-base font-semibold text-text-primary">Delete {deleteTarget.title}?</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-text-secondary">This permanently removes the custom experiment, source versions, private media, release artifacts and engagement data. Built-in experiments cannot be deleted.</p>
            <label className="mt-4 block rounded-[3px] border border-error/20 bg-error/[0.035] p-3 text-xs font-medium text-text-secondary sm:p-4">
              Type <span className="font-mono font-semibold text-text-primary">{deleteTarget.slug}</span> to confirm
              <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" spellCheck={false} className="mt-2 h-10 w-full rounded-[2px] border border-border bg-background px-3 font-mono text-xs text-text-primary outline-none transition-[border-color,box-shadow] duration-200 focus:border-error focus:ring-2 focus:ring-error/15 motion-reduce:transition-none" placeholder={deleteTarget.slug} />
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="inline-flex h-9 items-center justify-center rounded-[2px] border border-border bg-surface-2/50 px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none">Cancel</button>
              <button
                type="button"
                onClick={deleteExperiment}
                onMouseEnter={() => deleteConfirmIconRef.current?.startAnimation?.()}
                onMouseLeave={() => deleteConfirmIconRef.current?.stopAnimation?.()}
                onFocus={() => deleteConfirmIconRef.current?.startAnimation?.()}
                onBlur={() => deleteConfirmIconRef.current?.stopAnimation?.()}
                disabled={deleting || deleteConfirmation.trim() !== deleteTarget.slug}
                className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-error bg-error px-3 text-xs font-semibold text-error-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-error-hover hover:bg-error-hover hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {deleting ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <AnimatedTrash size={13} ref={deleteConfirmIconRef} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />}
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </section>
  );
}
