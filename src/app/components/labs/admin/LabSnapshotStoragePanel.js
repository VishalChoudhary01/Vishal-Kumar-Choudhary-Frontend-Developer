"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  HardDrive,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / (1024 ** index);
  return amount.toFixed(index >= 3 ? 2 : 1) + " " + units[index];
}

function formatDate(value) {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(value) {
  if (!value) return "—";
  return value.length > 24 ? value.slice(0, 13) + "…" + value.slice(-7) : value;
}

function Metric({ label, value, hint, icon: Icon }) {
  return (
    <div className="min-w-0 border border-border bg-surface-1 px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-tertiary">{label}</p>
        <Icon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
      </div>
      <p className="mt-2 break-words text-xl font-semibold tabular-nums text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-[10px] leading-4 text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

export default function LabSnapshotStoragePanel() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadReport = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/labs/sandbox-snapshots", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.data?.summary || !Array.isArray(payload.data.snapshots)) {
        throw new Error(payload?.error?.message || "Vercel snapshot inventory is unavailable.");
      }
      setReport(payload.data);
    } catch (reason) {
      setError(reason?.message || "Vercel snapshot inventory is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/admin/labs/sandbox-snapshots", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.data?.summary || !Array.isArray(payload.data.snapshots)) {
          throw new Error(payload?.error?.message || "Vercel snapshot inventory is unavailable.");
        }
        return payload.data;
      })
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((reason) => {
        if (active) setError(reason?.message || "Vercel snapshot inventory is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const snapshots = report?.snapshots || [];
  const summary = report?.summary || null;
  const [filter, setFilter] = useState("all");
  const filteredSnapshots = useMemo(() => {
    if (filter === "reclaimable") return snapshots.filter((item) => item.canDelete);
    if (filter === "protected") return snapshots.filter((item) => !item.canDelete);
    return snapshots;
  }, [filter, snapshots]);

  async function deleteSnapshot() {
    if (!deleteTarget || confirmation.trim() !== deleteTarget.id) return;
    setDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/labs/sandbox-snapshots", {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotId: deleteTarget.id,
          confirmation: confirmation.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.data?.deleted !== true || payload?.data?.verified !== true) {
        throw new Error(payload?.error?.message || "Vercel did not confirm snapshot deletion.");
      }

      if (payload.data.inventory) setReport(payload.data.inventory);
      else await loadReport({ quiet: true });

      setDeleteTarget(null);
      setConfirmation("");
    } catch (reason) {
      setError(reason?.message || "Snapshot deletion failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section aria-labelledby="snapshot-storage-title" className="mt-8">
      <div className="border border-border bg-surface-1">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-brand/30 bg-brand/5 text-brand">
              <Database size={17} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">VERCEL SANDBOX</p>
              <h2 id="snapshot-storage-title" className="mt-1 text-base font-semibold tracking-tight text-text-primary">
                Compiler snapshot storage
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-text-tertiary">
                Project-level snapshot inventory for this Labs deployment. Inspect protected snapshots and remove confirmed-unused automatic snapshots.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadReport({ quiet: true })}
            disabled={loading || refreshing || deleting}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {refreshing ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
            Refresh snapshots
          </button>
        </header>

        <div className="p-4 sm:p-5">
          {error ? (
            <div className="mb-4 flex items-start gap-2 border border-warning/40 bg-warning/10 px-3 py-3 text-xs leading-5 text-warning" role="alert">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-36 items-center justify-center gap-3 text-xs text-text-tertiary" role="status">
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              Loading Vercel snapshot inventory…
            </div>
          ) : report ? (
            <>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Metric
                  label="Project snapshot size"
                  value={formatBytes(summary.totalBytes)}
                  hint="Sum of listed active snapshots"
                  icon={HardDrive}
                />
                <Metric
                  label="Snapshots"
                  value={summary.activeSnapshotCount}
                  hint={summary.snapshotCount + " records returned"}
                  icon={Database}
                />
                <Metric
                  label="Potentially reclaimable"
                  value={formatBytes(summary.reclaimableBytes)}
                  hint={summary.reclaimableSnapshotCount + " safe automatic leaves"}
                  icon={Trash2}
                />
                <Metric
                  label="Protected"
                  value={summary.protectedSnapshotCount}
                  hint={summary.namedSandboxCount + " named Sandbox records scanned"}
                  icon={ShieldCheck}
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 border border-border-subtle bg-background/50 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-2 text-xs leading-5 text-text-secondary">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                  <p>
                    This is the snapshot total for this project, not your Hobby account's official storage allowance or billing meter.
                    Vercel's account usage is shown separately in its dashboard.
                  </p>
                </div>
                <a
                  href="https://vercel.com/dashboard/usage"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"
                >
                  Open Vercel Usage
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1" role="group" aria-label="Filter compiler snapshots">
                  {[
                    { value: "all", label: "All", count: snapshots.length },
                    { value: "reclaimable", label: "Can delete", count: summary.reclaimableSnapshotCount },
                    { value: "protected", label: "Protected", count: summary.protectedSnapshotCount },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value)}
                      aria-pressed={filter === option.value}
                      className={[
                        "min-h-8 border px-3 text-[11px] font-medium transition-colors",
                        filter === option.value
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-transparent text-text-secondary hover:border-border hover:bg-surface-2",
                      ].join(" ")}
                    >
                      {option.label} ({option.count})
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-tertiary">
                  Updated {formatDate(report.refreshedAt)}
                </p>
              </div>

              {filteredSnapshots.length ? (
                <div className="mt-3 divide-y divide-border border border-border">
                  {filteredSnapshots.map((snapshot) => (
                    <article key={snapshot.id} className="flex flex-col gap-3 px-3 py-3 sm:px-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="break-all font-mono text-[11px] font-semibold text-text-primary">{snapshot.id}</code>
                            {snapshot.canDelete ? (
                              <span className="inline-flex h-5 items-center gap-1 border border-warning/40 bg-warning/10 px-2 text-[9px] font-semibold uppercase tracking-wide text-warning">
                                <Trash2 size={10} aria-hidden="true" /> Safe to delete
                              </span>
                            ) : (
                              <span className="inline-flex h-5 items-center gap-1 border border-brand/30 bg-brand/5 px-2 text-[9px] font-semibold uppercase tracking-wide text-brand">
                                <ShieldCheck size={10} aria-hidden="true" /> Protected
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-tertiary">
                            <span>{formatBytes(snapshot.sizeBytes)}</span>
                            <span>{snapshot.creationMethod}</span>
                            <span>{snapshot.status}</span>
                            {snapshot.region ? <span>{snapshot.region}</span> : null}
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={10} aria-hidden="true" /> Created {formatDate(snapshot.createdAt)}
                            </span>
                          </div>
                        </div>

                        {snapshot.canDelete ? (
                          <button
                            type="button"
                            onClick={() => { setDeleteTarget(snapshot); setConfirmation(""); }}
                            disabled={deleting}
                            className="inline-flex h-8 shrink-0 items-center justify-center gap-2 border border-warning/50 px-3 text-[11px] font-semibold text-warning transition-colors hover:bg-warning/10 disabled:opacity-50"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                            Delete snapshot
                          </button>
                        ) : (
                          <span className="inline-flex h-8 shrink-0 items-center gap-2 text-[10px] text-success">
                            <CheckCircle2 size={12} aria-hidden="true" /> Retained
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-[10px] text-text-tertiary sm:grid-cols-2 lg:grid-cols-3">
                        <p>Last used: <span className="text-text-secondary">{formatDate(snapshot.lastUsedAt)}</span></p>
                        <p>Expires: <span className="text-text-secondary">{formatDate(snapshot.expiresAt)}</span></p>
                        <p>Parent: <code className="break-all text-text-secondary">{shortId(snapshot.parentId)}</code></p>
                        <p>Source session: <code className="break-all text-text-secondary">{shortId(snapshot.sourceSessionId)}</code></p>
                        <p>Sandbox references: <span className="text-text-secondary">{snapshot.sandboxNames.length}</span></p>
                        <p>Children: <span className="text-text-secondary">{snapshot.childSnapshotIds.length}</span></p>
                      </div>

                      {!snapshot.canDelete && snapshot.protectionReasons.length ? (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border-subtle pt-2 text-[10px] text-text-tertiary">
                          {snapshot.protectionReasons.map((reason) => (
                            <li key={reason} className="inline-flex items-center gap-1.5">
                              <ShieldCheck size={10} className="text-brand" aria-hidden="true" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm font-medium text-text-primary">No snapshots in this view</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {filter === "reclaimable" ? "No confirmed-unused automatic leaf snapshots are currently eligible for deletion." : "Try another filter or refresh the inventory."}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-36 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-text-primary">Snapshot inventory unavailable</p>
              <p className="mt-1 text-xs text-text-tertiary">Check the Vercel project OIDC integration and try again.</p>
              <button type="button" onClick={() => loadReport()} className="mt-3 text-xs font-semibold text-brand hover:underline">Try again</button>
            </div>
          )}
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="snapshot-delete-title"
            className="w-full max-w-lg border border-warning/40 bg-surface-1 p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-warning">
              <Trash2 size={16} aria-hidden="true" />
              <h2 id="snapshot-delete-title" className="text-base font-semibold text-text-primary">Delete Vercel snapshot?</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              This permanently removes the selected automatic snapshot. A deleted snapshot cannot be used to start another Sandbox.
              The server will re-check its references and parent relationships before deletion.
            </p>
            <div className="mt-3 border border-border bg-background p-3">
              <code className="break-all font-mono text-[11px] text-text-primary">{deleteTarget.id}</code>
              <p className="mt-1 text-[10px] text-text-tertiary">{formatBytes(deleteTarget.sizeBytes)} · {deleteTarget.region || "Region unavailable"}</p>
            </div>
            <label className="mt-4 block text-xs font-medium text-text-secondary">
              Type the complete snapshot ID to confirm
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="mt-2 h-10 w-full border border-border bg-background px-3 font-mono text-xs text-text-primary outline-none focus:border-warning"
                placeholder={deleteTarget.id}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setConfirmation(""); }}
                disabled={deleting}
                className="h-9 border border-border px-3 text-xs text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteSnapshot}
                disabled={deleting || confirmation.trim() !== deleteTarget.id}
                className="inline-flex h-9 items-center gap-2 border border-warning bg-warning/10 px-3 text-xs font-semibold text-warning disabled:cursor-not-allowed disabled:opacity-40"
              >
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
