"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LabArtwork from "./landing/LabArtwork";

/**
 * Shared non-executable preview renderer for Labs discovery surfaces.
 *
 * It renders only public selected media, the generated release poster or
 * existing artwork. The detail page's interactive runtime remains separate.
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

  // A deleted/revoked uploaded asset or a CDN failure must not leave an empty
  // card. Fall back to the exact published build's screenshot; then artwork.
  const activePreview = preview?.src === failedSrc
    ? generatedPoster?.src && generatedPoster.src !== failedSrc
      ? generatedPoster
      : null
    : preview;
  const fitClass = activePreview?.fit === "contain" ? "object-contain" : "object-cover";

  if (activePreview?.src && activePreview.mediaKind === "video") {
    return (
      <video
        src={activePreview.src}
        poster={generatedPoster?.src || undefined}
        aria-hidden="true"
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
          src={activePreview.src}
          alt={activePreview.alt || ""}
          width={900}
          height={675}
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
            width={900}
            height={675}
            sizes={sizes}
            unoptimized
            className={[`hidden motion-reduce:block ${className}`, fitClass].join(" ")}
          />
        ) : null}
      </>
    );
  }

  return <LabArtwork experiment={experiment} />;
}
