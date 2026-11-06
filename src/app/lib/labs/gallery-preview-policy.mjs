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
  const uploaded = isValidUploadedPreview(uploadedPreview)
    ? { ...uploadedPreview, fit: "contain" }
    : null;
  const generated = isValidGeneratedPoster(generatedPoster)
    ? { ...generatedPoster, fit: "contain" }
    : null;
  return {
    galleryVisual: uploaded || generated,
    thumbnail: uploaded?.mediaKind === "image" ? uploaded : generated,
    uploadedPreview: uploaded,
    generatedPoster: generated,
  };
}


/**
 * Resolve the next usable visual after a browser media error.
 * Failed uploaded media falls through to the exact release poster, then
 * an optional validated thumbnail. The caller uses its artwork fallback
 * when every candidate has failed.
 */
export function selectActiveGalleryPreview({
  uploadedPreview = null,
  generatedPoster = null,
  thumbnail = null,
  failedSources = [],
} = {}) {
  const failed = failedSources instanceof Set ? failedSources : new Set(failedSources);
  const candidates = [
    isValidUploadedPreview(uploadedPreview) ? uploadedPreview : null,
    isValidGeneratedPoster(generatedPoster) ? generatedPoster : null,
    thumbnail && typeof thumbnail.src === "string" && thumbnail.src
      ? thumbnail
      : null,
  ];

  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate?.src || seen.has(candidate.src)) continue;
    seen.add(candidate.src);
    if (!failed.has(candidate.src)) {
      return candidate;
    }
  }

  return null;
}
