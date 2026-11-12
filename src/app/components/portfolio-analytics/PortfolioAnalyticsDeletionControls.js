"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TrashIcon as AnimatedTrash } from "@animateicons/react/lucide/trash-icon";
import { X } from "lucide-react";

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
  const selectedDeleteIconRef = useRef(null);
  const dateRangeDeleteIconRef = useRef(null);
  const allDeleteIconRef = useRef(null);
  const dialogDeleteIconRef = useRef(null);
  const confirmDeleteIconRef = useRef(null);

  useEffect(() => {
    if (scope) dialogDeleteIconRef.current?.startAnimation?.();
  }, [scope]);

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
    <section className="rounded-[3px] border border-border bg-surface-1 p-5" aria-labelledby="portfolio-data-controls-title">
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
            onMouseEnter={() => selectedDeleteIconRef.current?.startAnimation?.()}
            onMouseLeave={() => selectedDeleteIconRef.current?.stopAnimation?.()}
            onFocus={() => selectedDeleteIconRef.current?.startAnimation?.()}
            onBlur={() => selectedDeleteIconRef.current?.stopAnimation?.()}
            disabled={selectedVisitIds.length === 0 || selectedVisitIds.length > 25}
            className="inline-flex min-h-9 items-center gap-2 rounded-[2px] border border-error/30 bg-error/[0.035] px-3 text-xs font-semibold text-error transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-error/55 hover:bg-error/10 hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <AnimatedTrash ref={selectedDeleteIconRef} size={13} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" />
            Delete selected ({selectedVisitIds.length})
          </button>
          <button
            type="button"
            onClick={() => openDialog("date_range")}
            onMouseEnter={() => dateRangeDeleteIconRef.current?.startAnimation?.()}
            onMouseLeave={() => dateRangeDeleteIconRef.current?.stopAnimation?.()}
            onFocus={() => dateRangeDeleteIconRef.current?.startAnimation?.()}
            onBlur={() => dateRangeDeleteIconRef.current?.stopAnimation?.()}
            className="inline-flex min-h-9 items-center gap-2 rounded-[2px] border border-error/30 bg-error/[0.035] px-3 text-xs font-semibold text-error transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-error/55 hover:bg-error/10 hover:shadow-sm active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <AnimatedTrash ref={dateRangeDeleteIconRef} size={13} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" />
            Delete date range
          </button>
          <button
            type="button"
            onClick={() => openDialog("all")}
            onMouseEnter={() => allDeleteIconRef.current?.startAnimation?.()}
            onMouseLeave={() => allDeleteIconRef.current?.stopAnimation?.()}
            onFocus={() => allDeleteIconRef.current?.startAnimation?.()}
            onBlur={() => allDeleteIconRef.current?.stopAnimation?.()}
            className="inline-flex min-h-9 items-center gap-2 rounded-[2px] border border-error/55 bg-error/10 px-3 text-xs font-semibold text-error shadow-sm transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-error/15 hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <AnimatedTrash ref={allDeleteIconRef} size={13} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" />
            Delete all data
          </button>
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-4 text-xs text-success">{notice}</p>
      ) : null}

      {scope ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-delete-dialog-title"
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[480px] rounded-[4px] border border-error/25 bg-surface-1 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.5)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[3px] border border-error/30 bg-error/10 text-error shadow-sm">
                  <AnimatedTrash ref={dialogDeleteIconRef} size={17} duration={0.68} isAnimated={!reduceMotion} aria-hidden="true" />
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
                className="grid size-8 shrink-0 place-items-center rounded-[2px] border border-transparent text-text-tertiary transition-[color,background-color,border-color] duration-200 hover:border-border hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40"
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
                    className="h-10 min-w-0 rounded-[2px] border border-border bg-background px-3 text-sm text-text-primary outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 motion-reduce:transition-none"
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

            <div className="mt-5 rounded-[3px] border border-error/20 bg-error/[0.035] p-3 sm:p-4">
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
                className="mt-3 h-10 w-full rounded-[2px] border border-border bg-surface-1 px-3 font-mono text-xs text-text-primary outline-none placeholder:text-text-tertiary transition-[border-color,box-shadow] duration-200 focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error/15 motion-reduce:transition-none"
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
                className="inline-flex min-h-9 items-center justify-center rounded-[2px] border border-border bg-surface-2/50 px-4 text-xs font-semibold text-text-secondary transition-[color,background-color,border-color,transform] duration-200 hover:border-border-strong hover:bg-surface-2 hover:text-text-primary active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40 motion-reduce:transition-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeletion}
                onMouseEnter={() => confirmDeleteIconRef.current?.startAnimation?.()}
                onMouseLeave={() => confirmDeleteIconRef.current?.stopAnimation?.()}
                onFocus={() => confirmDeleteIconRef.current?.startAnimation?.()}
                onBlur={() => confirmDeleteIconRef.current?.stopAnimation?.()}
                disabled={pending || confirmation !== expectedConfirmation}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[2px] border border-error bg-error px-4 text-xs font-semibold text-error-contrast shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-error-hover hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {!pending ? <AnimatedTrash ref={confirmDeleteIconRef} size={14} duration={0.62} isAnimated={!reduceMotion} aria-hidden="true" /> : null}
                {pending ? "Deleting…" : "Confirm deletion"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </section>
  );
}
