import Image from "next/image";
import LabArtwork from "./landing/LabArtwork";

/**
 * Shared non-executable preview renderer for Labs discovery surfaces.
 *
 * It deliberately renders a static asset/poster/artwork only. The detail page
 * has its own interactive runtime boundary and must never be mounted in cards.
 */
export default function LabExperimentPreview({
  experiment,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
  className = "h-full w-full",
}) {
  // Explicitly selected owner media always wins. The generated screenshot is
  // release-bound and used only when no upload has been selected.
  const preview =
    experiment?.galleryPreview ||
    experiment?.generatedPoster ||
    experiment?.thumbnail ||
    null;
  const generatedPoster = experiment?.generatedPoster || null;
  const fitClass = preview?.fit === "contain" ? "object-contain" : "object-cover";

  if (preview?.src && preview.mediaKind === "video") {
    return (
      <video
        src={preview.src}
        poster={generatedPoster?.src || undefined}
        aria-label={preview.alt || "Uploaded experiment video"}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className={[`pointer-events-none block ${className}`, fitClass].join(" ")}
      />
    );
  }

  if (preview?.src) {
    const isGif = preview.contentType === "image/gif" || preview.format === "gif";
    return (
      <>
        <Image
          src={preview.src}
          alt={preview.alt || ""}
          width={900}
          height={675}
          sizes={sizes}
          priority={preview.priority === true}
          unoptimized={isGif}
          className={[
            className,
            fitClass,
            isGif && generatedPoster ? "motion-reduce:hidden" : "",
          ].join(" ")}
        />
        {isGif && generatedPoster ? (
          <Image
            src={generatedPoster.src}
            alt={preview.alt || ""}
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
