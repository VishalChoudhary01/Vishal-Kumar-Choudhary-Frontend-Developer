const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

function isValidUploadedPreview(preview) {
  if (!preview || typeof preview.src !== "string" || !preview.src) return false;
  if (preview.mediaKind === "video") return VIDEO_TYPES.has(preview.contentType);
  return preview.mediaKind === "image" && IMAGE_TYPES.has(preview.contentType);
}

function isValidGeneratedPoster(poster) {
  return Boolean(
    poster &&
    poster.generated === true &&
    poster.mediaKind === "image" &&
    poster.contentType === "image/png" &&
    typeof poster.src === "string" &&
    poster.src,
  );
}

/**
 * Explicitly promoted upload wins over a generated screenshot.
 * The generated poster is the automatic fallback for code-only experiments.
 * Video still uses the generated PNG as its social/metadata thumbnail.
 */
export function resolveGalleryPreviewSelection({ uploadedPreview = null, generatedPoster = null } = {}) {
  const uploaded = isValidUploadedPreview(uploadedPreview) ? uploadedPreview : null;
  const generated = isValidGeneratedPoster(generatedPoster) ? generatedPoster : null;
  return {
    galleryVisual: uploaded || generated,
    thumbnail: uploaded?.mediaKind === "image" ? uploaded : generated,
    uploadedPreview: uploaded,
    generatedPoster: generated,
  };
}
