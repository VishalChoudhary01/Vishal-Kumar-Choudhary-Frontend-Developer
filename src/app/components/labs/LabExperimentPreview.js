"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { selectActiveGalleryPreview } from "@/app/lib/labs/gallery-preview-policy.mjs";

/**
 * Shared non-executable renderer for gallery, featured and detail previews.
 * It displays only media promoted from the current published source release:
 * an owner-selected upload, the exact-release generated poster, or a validated
 * sourced thumbnail. It never synthesizes experiment-specific artwork.
 */
export default function LabExperimentPreview({
  experiment,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
  className = "h-full w-full",
}) {
  const uploadedPreview = experiment?.galleryPreview || null;
  const generatedPoster = experiment?.generatedPoster || null;
  const thumbnail = experiment?.thumbnail || null;
  const [failedSources, setFailedSources] = useState(() => new Set());
  const [measuredDimensions, setMeasuredDimensions] = useState(null);
  const previewSourcesKey = [
    uploadedPreview?.src || "",
    generatedPoster?.src || "",
    thumbnail?.src || "",
  ].join("|");

  useEffect(() => {
    setFailedSources(new Set());
    setMeasuredDimensions(null);
  }, [experiment?.slug, previewSourcesKey]);

  const activePreview = selectActiveGalleryPreview({
    uploadedPreview,
    generatedPoster,
    thumbnail,
    failedSources,
  });

  function markPreviewFailed(src) {
    if (!src) return;
    setFailedSources((current) => {
      if (current.has(src)) return current;
      const next = new Set(current);
      next.add(src);
      return next;
    });
  }
  // Uploaded and generated media must preserve their intrinsic proportions.
  // The stage may letterbox portrait/square assets; it must never crop or stretch them.
  const fitClass = "object-contain object-center";
  const activeMeasured = measuredDimensions?.src === activePreview?.src ? measuredDimensions : null;
  const intrinsicWidth = activeMeasured?.width || (
    Number.isSafeInteger(activePreview?.width) && activePreview.width > 0 ? activePreview.width : 1200
  );
  const intrinsicHeight = activeMeasured?.height || (
    Number.isSafeInteger(activePreview?.height) && activePreview.height > 0 ? activePreview.height : 900
  );
  const posterWidth = Number.isSafeInteger(generatedPoster?.width) && generatedPoster.width > 0
    ? generatedPoster.width
    : 1200;
  const posterHeight = Number.isSafeInteger(generatedPoster?.height) && generatedPoster.height > 0
    ? generatedPoster.height
    : 900;

  if (activePreview?.src && activePreview.mediaKind === "video") {
    return (
      <video
        src={activePreview.src}
        poster={generatedPoster?.src && !failedSources.has(generatedPoster.src) ? generatedPoster.src : undefined}
        aria-label={activePreview.alt || experiment?.title || "Experiment video preview"}
        width={intrinsicWidth}
        height={intrinsicHeight}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          const width = event.currentTarget.videoWidth;
          const height = event.currentTarget.videoHeight;
          if (width > 0 && height > 0) setMeasuredDimensions({ src: activePreview.src, width, height });
        }}
        onError={() => markPreviewFailed(activePreview.src)}
        className={[`pointer-events-none block ${className}`, fitClass].join(" ")}
      />
    );
  }

  if (activePreview?.src) {
    const isGif =
      activePreview.contentType === "image/gif" ||
      activePreview.format === "gif";
    return (
      <>
        <Image
          key={activePreview.src}
          src={activePreview.src}
          alt={activePreview.alt || ""}
          width={intrinsicWidth}
          height={intrinsicHeight}
          sizes={sizes}
          priority={activePreview.priority === true}
          unoptimized={isGif}
          onLoad={(event) => {
            const width = event.currentTarget.naturalWidth;
            const height = event.currentTarget.naturalHeight;
            if (width > 0 && height > 0) setMeasuredDimensions({ src: activePreview.src, width, height });
          }}
          onError={() => markPreviewFailed(activePreview.src)}
          className={[
            className,
            fitClass,
            isGif && generatedPoster ? "motion-reduce:hidden" : "",
          ].join(" ")}
        />
        {isGif && generatedPoster?.src && generatedPoster.src !== activePreview.src ? (
          <Image
            src={generatedPoster.src}
            alt={activePreview.alt || ""}
            width={posterWidth}
            height={posterHeight}
            sizes={sizes}
            unoptimized
            onLoad={(event) => {
              const width = event.currentTarget.naturalWidth;
              const height = event.currentTarget.naturalHeight;
              if (width > 0 && height > 0) setMeasuredDimensions({ src: generatedPoster.src, width, height });
            }}
            onError={() => markPreviewFailed(generatedPoster.src)}
            className={[`hidden motion-reduce:block ${className}`, fitClass].join(" ")}
          />
        ) : null}
      </>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={[`relative grid min-h-[160px] w-full place-items-center overflow-hidden bg-surface-2`, className].join(" ")}
    >
      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-text-tertiary">
        Preview media unavailable
      </span>
    </div>
  );
}
