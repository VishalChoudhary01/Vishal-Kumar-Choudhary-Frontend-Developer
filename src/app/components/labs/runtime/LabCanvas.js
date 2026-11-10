"use client";

const RATIOS = {
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
  "3:4": "3 / 4",
};

function getRatio(value, fallback) {
  return RATIOS[value] || RATIOS[fallback];
}

/**
 * The fullscreen target includes the compact action row. This keeps the
 * explicit Exit fullscreen control available while fullscreen is active.
 */
export default function LabCanvas({
  canvasRef,
  aspectRatio,
  isFullscreen,
  children,
  actions,
}) {
  const mobileRatio = getRatio(aspectRatio?.mobile, "4:3");
  const desktopRatio = getRatio(aspectRatio?.desktop, "16:9");

  return (
    <div
      ref={canvasRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[999] flex h-[100dvh] w-screen flex-col bg-background p-4 sm:p-6"
          : "w-full"
      }
      aria-label="Experiment canvas"
    >
      <div
        style={{
          "--lab-mobile-ratio": mobileRatio,
          "--lab-desktop-ratio": desktopRatio,
        }}
        className={[
          "relative w-full overflow-hidden border border-border-subtle bg-surface-2",
          isFullscreen
            ? "min-h-0 flex-1"
            : "[aspect-ratio:var(--lab-mobile-ratio)] lg:[aspect-ratio:var(--lab-desktop-ratio)]",
        ].join(" ")}
      >
        <div className="absolute inset-0">{children}</div>
      </div>

      {actions ? (
        <div className={isFullscreen ? "shrink-0 pt-2" : "shrink-0"}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
