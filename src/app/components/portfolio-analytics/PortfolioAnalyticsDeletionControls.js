"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TrashIcon as AnimatedTrash } from "@animateicons/react/lucide/trash-icon";
import { AlertTriangle, X } from "lucide-react";

const API_PATH = "/api/v1/admin/portfolio/analytics/visits";
const DELETE_ALL_CONFIRMATION = "DELETE ALL PORTFOLIO VISIT DATA";

function utcDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function confirmationFor(scope, selectedCount, from, to) {
  if (scope === "selected") {
    return "DELETE " + selectedCount + " SELECTED " +
      (selectedCount === 1 ? "VISIT" : "VISITS");
  }
  if (scope === "date_range") {
    return "DELETE VISITS FROM " + from + " TO " + to;
  }
  return DELETE_ALL_CONFIRMATION;
}

export default function PortfolioAnalyticsDeletionControls({
  selectedVisitIds = [],
  onClearSelection,
  onDeleted,
}) {
  const reduceMotion = useReducedMotion();
  const [scope, setScope] = useState(null);
  const [from, setFrom] = useState(() => utcDate(-6));
  const [to, setTo] = useState(() => utcDate(0));
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const expectedConfirmation = useMemo(
    () => confirmationFor(scope, selectedVisitIds.length, from, to),
    [scope, selectedVisitIds.length, from, to],
  );

  const openDialog = (nextScope) => {
    setScope(nextScope);
    setConfirmation("");
    setError("");
    setNotice("");
  };

  const closeDialog = () => {
    if (pending) return;
    setScope(null);
    setConfirmation("");
    setError("");
  };

  const submitDeletion = async () => {
    if (!scope || confirmation !== expectedConfirmation || pending) return;

    const body = scope === "selected"
      ? { scope, visitIds: selectedVisitIds, confirmation }
      : scope === "date_range"
        ? { scope, from, to, confirmation }
        : { scope, confirmation };

    setPending(true);
    setError("");

    try {
      const response = await fetch(API_PATH, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.data) {
        const failure = new Error(
          payload?.error?.message || "The visit records could not be deleted.",
        );
        failure.status = response.status;
        throw failure;
      }

      const deletedCount = Math.max(0, Number(payload.data.deletedCount) || 0);
      setNotice(
        deletedCount === 0
          ? "No matching visit records remained to delete."
          : deletedCount.toLocaleString("en-IN") +
              (deletedCount === 1 ? " visit record deleted." : " visit records deleted."),
      );

      onClearSelection?.();
      onDeleted?.(payload.data);
      setScope(null);
      setConfirmation("");
    } catch (failure) {
      setError(
        failure?.status === 401 || failure?.status === 404
          ? "Owner access could not be verified. Sign in again."
          : failure?.message || "The visit records could not be deleted.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="border border-border bg-surface-1 p-5" aria-labelledby="portfolio-data-controls-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="portfolio-data-controls-title" className="text-sm font-semibold text-text-primary">
            Visit data controls
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Remove individual visits, a date window, or all stored portfolio visit records.
            These actions do not change the automatic 65-day retention policy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openDialog("selected")}
            disabled={selectedVisitIds.length === 0 || selectedVisitIds.length > 25}
            className="inline-flex min-h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-warning hover:text-warning disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AnimatedTrash size={13} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" />
            Delete selected ({selectedVisitIds.length})
          </button>
          <button
            type="button"
            onClick={() => openDialog("date_range")}
            className="inline-flex min-h-9 items-center gap-2 border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-warning hover:text-warning"
          >
            <AnimatedTrash size={13} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" />
            Delete date range
          </button>
          <button
            type="button"
            onClick={() => openDialog("all")}
            className="inline-flex min-h-9 items-center gap-2 border border-warning/50 px-3 text-xs font-semibold text-warning transition-colors hover:bg-warning/10"
          >
            <AlertTriangle size={13} aria-hidden="true" />
            Delete all data
          </button>
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-4 text-xs text-success">{notice}</p>
      ) : null}

      {scope ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-delete-dialog-title"
            className="w-full max-w-[480px] border border-border bg-surface-1 p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center border border-warning/30 bg-warning/10 text-warning">
                  <AlertTriangle size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3 id="portfolio-delete-dialog-title" className="text-base font-semibold text-text-primary">
                    {scope === "all"
                      ? "Delete all visit data?"
                      : scope === "date_range"
                        ? "Delete visits in this date range?"
                        : "Delete selected visits?"}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-text-tertiary">
                    This action is permanent for the selected application records and cannot be undone here.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                aria-label="Close deletion confirmation"
                className="grid size-8 shrink-0 place-items-center text-text-tertiary transition-colors hover:text-text-primary disabled:opacity-40"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {scope === "date_range" ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium text-text-secondary">
                  Start date (UTC)
                  <input
                    type="date"
                    value={from}
                    max={to || utcDate(0)}
                    onChange={(event) => setFrom(event.target.value)}
                    className="h-10 min-w-0 border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:border-brand"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-text-secondary">
                  End date (UTC)
                  <input
                    type="date"
                    value={to}
                    min={from}
                    max={utcDate(0)}
                    onChange={(event) => setTo(event.target.value)}
                    className="h-10 min-w-0 border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:border-brand"
                  />
                </label>
                <p className="text-[11px] leading-5 text-text-tertiary sm:col-span-2">
                  The date range is inclusive and cannot exceed 65 calendar days.
                </p>
              </div>
            ) : null}

            <div className="mt-5 border border-border bg-background p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Type this exact confirmation
              </p>
              <p className="mt-2 break-words font-mono text-xs font-semibold text-text-primary">
                {expectedConfirmation}
              </p>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                aria-label="Deletion confirmation phrase"
                placeholder="Enter confirmation phrase"
                className="mt-3 h-10 w-full border border-border bg-surface-1 px-3 font-mono text-xs text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-brand"
              />
            </div>

            {error ? (
              <p role="alert" className="mt-3 text-xs leading-5 text-warning">{error}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                className="inline-flex min-h-9 items-center justify-center border border-border px-4 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeletion}
                disabled={pending || confirmation !== expectedConfirmation}
                className="inline-flex min-h-9 items-center justify-center border border-warning bg-warning px-4 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Deleting…" : "Confirm deletion"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
