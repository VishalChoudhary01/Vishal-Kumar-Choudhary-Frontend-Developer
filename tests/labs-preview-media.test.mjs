import assert from "node:assert/strict";
import test from "node:test";

import { resolveGalleryPreviewSelection, selectActiveGalleryPreview } from "../src/app/lib/labs/gallery-preview-policy.mjs";

const generatedPoster = {
  src: "/api/v1/labs/spotlightdock/runtime/artifact-1/__preview/gallery-poster.png",
  alt: "Screenshot preview",
  mediaKind: "image",
  contentType: "image/png",
  generated: true,
  width: 1200,
  height: 900,
  fit: "cover",
};

test("generated screenshot is the default and keeps its real 4:3 dimensions", () => {
  const result = resolveGalleryPreviewSelection({ generatedPoster });

  assert.equal(result.galleryVisual.src, generatedPoster.src);
  assert.equal(result.thumbnail.src, generatedPoster.src);
  assert.equal(result.galleryVisual.fit, "contain");
  assert.equal(result.galleryVisual.width, 1200);
  assert.equal(result.galleryVisual.height, 900);
  assert.equal(result.uploadedPreview, null);
});

test("uploaded portrait image replaces the generated screenshot without losing dimensions", () => {
  const uploadedPreview = {
    src: "https://media.public.blob.vercel-storage.com/portrait.webp",
    alt: "Portrait project image",
    mediaKind: "image",
    contentType: "image/webp",
    width: 900,
    height: 1600,
    fit: "cover",
  };

  const result = resolveGalleryPreviewSelection({ uploadedPreview, generatedPoster });

  assert.equal(result.galleryVisual.src, uploadedPreview.src);
  assert.equal(result.galleryVisual.fit, "contain");
  assert.equal(result.galleryVisual.width, 900);
  assert.equal(result.galleryVisual.height, 1600);
  assert.equal(result.thumbnail.src, uploadedPreview.src);
  assert.equal(result.generatedPoster.src, generatedPoster.src);
});

test("uploaded GIF keeps its animated content type and uses the poster for reduced-motion metadata", () => {
  const uploadedPreview = {
    src: "https://media.public.blob.vercel-storage.com/animation.gif",
    alt: "Animated project preview",
    mediaKind: "image",
    contentType: "image/gif",
    format: "gif",
    width: 720,
    height: 720,
  };

  const result = resolveGalleryPreviewSelection({ uploadedPreview, generatedPoster });

  assert.equal(result.galleryVisual.src, uploadedPreview.src);
  assert.equal(result.galleryVisual.contentType, "image/gif");
  assert.equal(result.galleryVisual.fit, "contain");
  assert.equal(result.thumbnail.src, uploadedPreview.src);
  assert.equal(result.generatedPoster.src, generatedPoster.src);
});

test("uploaded video replaces the screenshot visual but keeps the generated poster thumbnail", () => {
  const uploadedPreview = {
    src: "https://media.public.blob.vercel-storage.com/demo.webm",
    alt: "Video project preview",
    mediaKind: "video",
    contentType: "video/webm",
    width: 1920,
    height: 1080,
  };

  const result = resolveGalleryPreviewSelection({ uploadedPreview, generatedPoster });

  assert.equal(result.galleryVisual.src, uploadedPreview.src);
  assert.equal(result.galleryVisual.mediaKind, "video");
  assert.equal(result.galleryVisual.fit, "contain");
  assert.equal(result.galleryVisual.width, 1920);
  assert.equal(result.galleryVisual.height, 1080);
  assert.equal(result.thumbnail.src, generatedPoster.src);
});

test("invalid uploaded media never masks the generated screenshot", () => {
  const result = resolveGalleryPreviewSelection({
    uploadedPreview: {
      src: "javascript:alert(1)",
      mediaKind: "video",
      contentType: "video/unknown",
      width: 1,
      height: 1,
    },
    generatedPoster,
  });

  assert.equal(result.galleryVisual.src, generatedPoster.src);
  assert.equal(result.galleryVisual.fit, "contain");
  assert.equal(result.uploadedPreview, null);
});

test("missing poster and invalid upload produce no external media selection", () => {
  const result = resolveGalleryPreviewSelection({
    uploadedPreview: { src: "", mediaKind: "image", contentType: "image/png" },
    generatedPoster: { src: "/broken.png", mediaKind: "image", contentType: "image/png", generated: false },
  });

  assert.equal(result.galleryVisual, null);
  assert.equal(result.thumbnail, null);
  assert.equal(result.generatedPoster, null);
});


test("failed uploaded media falls through to the generated poster", () => {
  const uploadedPreview = {
    src: "https://media.public.blob.vercel-storage.com/portrait.webp",
    mediaKind: "image",
    contentType: "image/webp",
  };
  const result = selectActiveGalleryPreview({
    uploadedPreview,
    generatedPoster,
    failedSources: new Set([uploadedPreview.src]),
  });

  assert.equal(result.src, generatedPoster.src);
});

test("failed uploaded media and poster fall through to artwork instead of retrying broken sources", () => {
  const uploadedPreview = {
    src: "https://media.public.blob.vercel-storage.com/portrait.webp",
    mediaKind: "image",
    contentType: "image/webp",
  };
  const result = selectActiveGalleryPreview({
    uploadedPreview,
    generatedPoster,
    failedSources: new Set([uploadedPreview.src, generatedPoster.src]),
  });

  assert.equal(result, null);
});

test("a broken poster without an uploaded asset resolves to artwork fallback", () => {
  const result = selectActiveGalleryPreview({
    generatedPoster,
    failedSources: [generatedPoster.src],
  });
  assert.equal(result, null);
});
