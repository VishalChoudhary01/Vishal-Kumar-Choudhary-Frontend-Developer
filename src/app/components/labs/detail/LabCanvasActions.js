"use client";

export default function LabCanvasActions({
  canRestart,
  onRestart,
  canFullscreen,
  isFullscreen,
  onToggleFullscreen,
}) {
  if (!canRestart && !canFullscreen) return null;

  return (
    <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
      {canRestart ? (
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7v5h-5" />
            <path d="M4.8 16.5A8 8 0 0 0 18.6 18M4 12a8 8 0 0 1 13.8-5L20 12" />
          </svg>
          Restart
        </button>
      ) : null}

      {canFullscreen ? (
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      ) : null}
    </div>
  );
}
