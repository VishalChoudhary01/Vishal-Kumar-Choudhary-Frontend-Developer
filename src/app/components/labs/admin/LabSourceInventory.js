"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionToast } from "@/app/providers/ActionToastProvider";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Clock3,
  FileCode2,
  FolderPlus,
  LoaderCircle,
  RefreshCw,
  Search,
  SearchX,
  Trash2,
} from "lucide-react";

const FILTERS = [
  { value: "all", label: "All experiments" },
  { value: "missing", label: "No source" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
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
  }[state];

  return (
    <span className={["inline-flex h-6 items-center border px-2 text-[10px] font-semibold", config.className].join(" ")}>
      {config.label}
    </span>
  );
}

export default function LabSourceInventory() {
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
        return result;
      },
      { total: 0, missing: 0, setup: 0, draft: 0, published: 0 },
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
        (filter === "published" && state === "published");
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
        throw new Error(payload?.error?.message || "Could not create source.");
      }

      setItems((current) =>
        current.map((item) =>
          item.slug === slug
            ? {
                ...item,
                hasSource: true,
                published: false,
                draftVersionId: null,
                latestVersion: null,
                legacyVersion: "0.0",
              }
            : item,
        ),
      );
      showToast("success", "Source workspace created.");
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
            Manage the four built-in demos and create original experiments with private source workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/labs/experiments/new"
            className="inline-flex h-9 items-center gap-2 bg-brand px-3 text-xs font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Plus size={14} aria-hidden="true" />
            New experiment
          </Link>
          <button
          type="button"
          onClick={() => loadInventory({ quiet: true })}
          disabled={loading || refreshing || Boolean(creating)}
          className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {refreshing ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={14} aria-hidden="true" />
          )}
          Refresh
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Experiments", value: counts.total },
          { label: "No source", value: counts.missing },
          { label: "Drafts", value: counts.draft + counts.setup },
          { label: "Published", value: counts.published },
        ].map((metric) => (
          <div key={metric.label} className="border border-border bg-surface-1 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
              {metric.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border border-border bg-surface-1 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search experiments</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by experiment name or slug"
            className="h-10 w-full border border-border bg-background pl-9 pr-3 text-xs text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-brand"
          />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter source inventory">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={[
                "min-h-9 border px-3 text-[11px] font-medium transition-colors",
                filter === option.value
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-transparent text-text-secondary hover:border-border hover:bg-surface-2",
              ].join(" ")}
            >
              {option.label}
              {option.value === "all" ? " (" + counts.total + ")" : option.value === "missing" ? " (" + counts.missing + ")" : option.value === "draft" ? " (" + (counts.draft + counts.setup) + ")" : " (" + counts.published + ")"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => loadInventory()} className="font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 flex min-h-40 items-center justify-center gap-3 border border-border bg-surface-1 text-xs text-text-tertiary" role="status">
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          Loading source inventory…
        </div>
      ) : filteredItems.length ? (
        <div className="mt-4 divide-y divide-border border border-border bg-surface-1">
          {filteredItems.map((item) => {
            const state = getSourceState(item);
            const hasWorkspace = item.hasSource;
            return (
              <article key={item.slug} className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-2/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background text-text-tertiary">
                    {state === "published" ? (
                      <CheckCircle2 size={16} className="text-brand" aria-hidden="true" />
                    ) : state === "missing" ? (
                      <FolderPlus size={16} aria-hidden="true" />
                    ) : (
                      <FileCode2 size={16} aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-text-primary">{item.title}</h3>
                      {item.isCustom ? (
                        <span className="inline-flex h-6 items-center border border-brand/30 bg-brand/5 px-2 text-[10px] font-semibold text-brand">
                          OWNER CREATED
                        </span>
                      ) : null}
                      <StateLabel state={state} />
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-text-tertiary">{item.slug}</p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-text-secondary">{item.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-tertiary">
                      <span>{item.versionCount || 0} saved versions</span>
                      {item.latestVersion ? <span>Latest {item.latestVersion}</span> : null}
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} aria-hidden="true" />
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                  {hasWorkspace ? (
                    <>
                    <Link
                      href={"/admin/labs/sources/" + encodeURIComponent(item.slug)}
                      className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Open workspace
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>
                    {item.isCustom ? (
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(item); setDeleteConfirmation(""); }}
                        disabled={Boolean(creating) || deleting}
                        aria-label={"Delete " + item.title}
                        title="Delete custom experiment"
                        className="grid h-9 w-9 place-items-center border border-warning/40 text-warning transition-colors hover:bg-warning/10 disabled:opacity-40"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => createSource(item.slug)}
                      disabled={Boolean(creating)}
                      className="inline-flex h-9 items-center gap-2 bg-brand px-3 text-xs font-semibold text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-50"
                    >
                      {creating === item.slug ? (
                        <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <FolderPlus size={13} aria-hidden="true" />
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
        <div className="mt-4 flex min-h-44 flex-col items-center justify-center border border-dashed border-border bg-surface-1 px-5 text-center">
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
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="inventory-delete-title" className="w-full max-w-md border border-warning/40 bg-surface-1 p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-warning">
              <Trash2 size={16} aria-hidden="true" />
              <h2 id="inventory-delete-title" className="text-base font-semibold">Delete {deleteTarget.title}?</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">This permanently removes the custom experiment, source versions, private media, release artifacts and engagement data. Built-in experiments cannot be deleted.</p>
            <label className="mt-4 block text-xs font-medium text-text-secondary">
              Type <span className="font-mono text-text-primary">{deleteTarget.slug}</span> to confirm
              <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" spellCheck={false} className="mt-2 h-10 w-full border border-border bg-background px-3 font-mono text-xs text-text-primary outline-none focus:border-warning" placeholder={deleteTarget.slug} />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="h-9 border border-border px-3 text-xs">Cancel</button>
              <button type="button" onClick={deleteExperiment} disabled={deleting || deleteConfirmation.trim() !== deleteTarget.slug} className="inline-flex h-9 items-center gap-2 border border-warning bg-warning/10 px-3 text-xs font-semibold text-warning disabled:cursor-not-allowed disabled:opacity-40">
                {deleting ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
