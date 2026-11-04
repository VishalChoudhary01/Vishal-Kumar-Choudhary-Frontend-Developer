"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderPlus, LoaderCircle } from "lucide-react";

export default function LabSourceInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
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
        if (active) setItems(payload.data);
      } catch (reason) {
        if (active) setError(reason.message || "Source inventory is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

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
      if (!response.ok) throw new Error(payload?.error?.message || "Could not create source.");

      setItems((current) =>
        current.map((item) =>
          item.slug === slug ? { ...item, hasSource: true, published: false } : item,
        ),
      );
    } catch (reason) {
      setError(reason.message || "Could not create source.");
    } finally {
      setCreating("");
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Source management</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Create private source records, edit drafts and publish a version for verified accounts.
          </p>
        </div>
        {loading ? (
          <span className="inline-flex items-center gap-2 text-xs text-text-tertiary">
            <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
            Loading inventory
          </span>
        ) : null}
      </div>

      {error ? <p role="alert" className="mt-3 text-xs text-warning">{error}</p> : null}

      <div className="mt-4 divide-y divide-border rounded-sm border border-border">
        {items.map((item) => (
          <div key={item.slug} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs text-text-tertiary">
                {item.slug} · {item.hasSource ? (item.published ? "Published" : "Draft only") : "No source record"}
                {item.versionCount ? " · " + item.versionCount + " saved versions" : ""}
              </p>
            </div>
            {item.hasSource ? (
              <Link
                href={"/admin/labs/sources/" + encodeURIComponent(item.slug)}
                className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Manage source
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => createSource(item.slug)}
                disabled={creating === item.slug}
                className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
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
        ))}
        {!loading && !items.length ? (
          <p className="px-4 py-6 text-sm text-text-tertiary">No Labs experiments are available.</p>
        ) : null}
      </div>
    </section>
  );
}
