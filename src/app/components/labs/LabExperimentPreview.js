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
}) {
  const preview =
    experiment?.galleryPreview ||
    experiment?.thumbnail ||
    experiment?.generatedPoster ||
    null;

  if (preview?.src) {
    return (
      <Image
        src={preview.src}
        alt={preview.alt || ""}
        width={900}
        height={675}
        sizes={sizes}
        priority={preview.priority === true}
        className={[
          "h-full w-full",
          preview.fit === "contain" ? "object-contain" : "object-cover",
        ].join(" ")}
      />
    );
  }

  return <LabArtwork experiment={experiment} />;
}
