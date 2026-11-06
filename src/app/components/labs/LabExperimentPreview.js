"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LabArtwork from "./landing/LabArtwork";

/**
 * Shared non-executable renderer for gallery, featured and detail previews.
 * Uploaded media wins; failed uploads fall back to the generated release
 * screenshot; if both fail, existing artwork preserves the card layout.
 * Public detail pages render media only; executable runtimes are not mounted here.
 */
export default function LabExperimentPreview({
  experiment,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
  className = "h-full w-full",
}) {
  const preview =
    experiment?.galleryPreview ||
    experiment?.generatedPoster ||
    experiment?.thumbnail ||
    null;
  const generatedPoster = experiment?.generatedPoster || null;
  const [failedSrc, setFailedSrc] = useState("");

  useEffect(() => {
    setFailedSrc("");
  }, [experiment?.slug, preview?.src, generatedPoster?.src]);

  const activePreview = preview?.src === failedSrc
    ? generatedPoster?.src && generatedPoster.src !== failedSrc
      ? generatedPoster
      : null
    : preview;
  // Uploaded and generated media must preserve their intrinsic proportions.
  // The stage may letterbox portrait/square assets; it must never crop or stretch them.
  const fitClass = "object-contain object-center";
  const intrinsicWidth = Number.isSafeInteger(activePreview?.width) && activePreview.width > 0
    ? activePreview.width
    : 1200;
  const intrinsicHeight = Number.isSafeInteger(activePreview?.height) && activePreview.height > 0
    ? activePreview.height
    : 900;

  if (activePreview?.src && activePreview.mediaKind === "video") {
    return (
      <video
        src={activePreview.src}
        poster={generatedPoster?.src || undefined}
        aria-label={activePreview.alt || experiment?.title || "Experiment video preview"}
        width={intrinsicWidth}
        height={intrinsicHeight}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailedSrc(activePreview.src)}
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
          onError={() => setFailedSrc(activePreview.src)}
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
            width={intrinsicWidth}
            height={intrinsicHeight}
            sizes={sizes}
            unoptimized
            onError={() => setFailedSrc(generatedPoster.src)}
            className={[`hidden motion-reduce:block ${className}`, fitClass].join(" ")}
          />
        ) : null}
      </>
    );
  }

  return <LabArtwork experiment={experiment} />;
}
