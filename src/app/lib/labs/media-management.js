import "server-only";

import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabExperiment from "./models/LabExperiment";
import LabMediaAsset from "./models/LabMediaAsset";
import LabSource from "./models/LabSource";
import LabBuildArtifact from "./models/LabBuildArtifact";
import LabSourceAuditEvent from "./models/LabSourceAuditEvent";
import { isLabsOwner } from "./owner-access";

const FORMAT_RULES = {
  image: {
    resourceType: "image",
    presetEnv: "CLOUDINARY_LABS_IMAGE_UPLOAD_PRESET",
    formats: ["jpg", "jpeg", "png", "webp", "avif", "gif"],
  },
  video: {
    resourceType: "video",
    presetEnv: "CLOUDINARY_LABS_VIDEO_UPLOAD_PRESET",
    formats: ["mp4", "webm"],
  },
};
const INTENT_LIFETIME_MS = 15 * 60 * 1000;

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    fail("MEDIA_CONFIG_MISSING", "Cloudinary media uploads are not configured for this environment.");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(cloudName) || !/^[A-Za-z0-9]+$/.test(apiKey)) {
    fail("MEDIA_CONFIG_MISSING", "Cloudinary media configuration is invalid.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return { client: cloudinary, cloudName, apiKey, apiSecret };
}

function safeFilename(value) {
  const filename = typeof value === "string" ? value.trim().split(/[\\/]/).pop() : "";
  const safe = (filename || "upload").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 180);
  return safe || "upload";
}

function validateUploadInput(input) {
  const mediaKind = input?.mediaKind;
  const rule = FORMAT_RULES[mediaKind];
  if (!rule) fail("MEDIA_INVALID", "Choose an image or video file.");

  const originalFilename = safeFilename(input?.originalFilename);
  const extension = originalFilename.split(".").pop()?.toLowerCase() || "";
  const normalizedFormat = extension === "jpeg" ? "jpg" : extension;
  if (!rule.formats.includes(extension) && !rule.formats.includes(normalizedFormat)) {
    fail(
      "MEDIA_INVALID",
      mediaKind === "image"
        ? "Supported images are JPEG, PNG, WebP, AVIF and GIF."
        : "Supported videos are MP4 and WebM.",
    );
  }

  const declaredBytes = Number(input?.byteSize);
  if (!Number.isSafeInteger(declaredBytes) || declaredBytes <= 0) {
    fail("MEDIA_INVALID", "The selected file has an invalid size.");
  }

  const maxBytes = Number(process.env.LABS_MEDIA_MAX_UPLOAD_BYTES);
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    fail("MEDIA_CONFIG_MISSING", "Set LABS_MEDIA_MAX_UPLOAD_BYTES after confirming the media quota for this Cloudinary account.");
  }
  if (declaredBytes > maxBytes) {
    fail("MEDIA_INVALID", "The selected file exceeds the configured Labs media upload limit.");
  }

  return { mediaKind, rule, originalFilename, declaredBytes, maxBytes };
}

async function assertCustomExperiment(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("NOT_FOUND", "Experiment not found.");
  }
  await connectToDatabase();
  const experiment = await LabExperiment.findOne({ slug, kind: "custom" })
    .select("slug mediaAttachments galleryPreview")
    .lean();
  if (!experiment) fail("NOT_FOUND", "Experiment not found.");
  return experiment;
}

function serializeAsset(
  asset,
  attachment = null,
  previewUrl = null,
  isGalleryPreview = false,
  isGalleryPreviewCurrent = false,
) {
  return {
    id: String(asset._id),
    uploadIntentId: asset.uploadIntentId,
    experimentSlug: asset.experimentSlug,
    originalFilename: asset.originalFilename,
    mediaKind: asset.mediaKind,
    format: asset.format,
    byteSize: asset.byteSize,
    width: asset.width,
    height: asset.height,
    durationSeconds: asset.durationSeconds,
    status: asset.status,
    altText: attachment?.altText || asset.altText || "",
    caption: attachment?.caption || asset.caption || "",
    roles: attachment?.roles || [],
    isGalleryPreview,
    isGalleryPreviewCurrent,
    previewUrl,
    createdAt: asset.createdAt ? new Date(asset.createdAt).toISOString() : null,
  };
}


function createOwnerPreviewUrl(client, asset) {
  if (!asset?.cloudinaryPublicId || !asset?.format) return null;
  try {
    return client.utils.private_download_url(asset.cloudinaryPublicId, asset.format, {
      resource_type: asset.resourceType,
      type: asset.deliveryType,
      expires_at: Math.floor(Date.now() / 1000) + 300,
      attachment: false,
    });
  } catch {
    return null;
  }
}

export async function createOwnerLabMediaUploadIntent({ user, slug, input }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  const { mediaKind, rule, originalFilename, declaredBytes } = validateUploadInput(input);
  await assertCustomExperiment(slug);

  const { client, cloudName, apiKey, apiSecret } = getCloudinary();
  const uploadPreset = process.env[rule.presetEnv]?.trim();
  if (!uploadPreset || !/^[A-Za-z0-9_-]{1,100}$/.test(uploadPreset)) {
    fail("MEDIA_CONFIG_MISSING", "Configure a signed Cloudinary Labs " + mediaKind + " upload preset before uploading media.");
  }

  let preset;
  try {
    preset = await client.api.upload_preset(uploadPreset);
  } catch {
    fail("MEDIA_CONFIG_MISSING", "The configured Cloudinary Labs " + mediaKind + " upload preset could not be verified.");
  }
  if (!preset || preset.unsigned !== false) {
    fail("MEDIA_CONFIG_MISSING", "The Cloudinary Labs " + mediaKind + " upload preset must use signed mode.");
  }

  await LabMediaAsset.createIndexes();
  await LabSourceAuditEvent.createIndexes();

  const uploadIntentId = randomUUID();
  const cloudinaryPublicId = "labs-" + slug + "-" + uploadIntentId.replace(/-/g, "");
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(Date.now() + INTENT_LIFETIME_MS);
  const allowedFormats = rule.formats.join(",");
  const signedFields = {
    timestamp,
    upload_preset: uploadPreset,
    public_id: cloudinaryPublicId,
    allowed_formats: allowedFormats,
    type: "authenticated",
    overwrite: false,
  };

  const signature = client.utils.api_sign_request(signedFields, apiSecret);
  const uploadUrl = "https://api.cloudinary.com/v1_1/" +
    encodeURIComponent(cloudName) + "/" + rule.resourceType + "/upload";

  const [asset] = await LabMediaAsset.create([{
    uploadIntentId,
    experimentSlug: slug,
    ownerUserId: user.id,
    originalFilename,
    mediaKind,
    resourceType: rule.resourceType,
    deliveryType: "authenticated",
    cloudinaryPublicId,
    status: "uploading",
    expiresAt,
  }]);

  await LabSourceAuditEvent.create({
    actorUserId: user.id,
    action: "media_upload_intent_created",
    experimentSlug: slug,
    versionId: null,
    requestId: uploadIntentId,
    resultCode: "ok",
    createdAt: new Date(),
  });

  return {
    uploadIntentId,
    assetId: String(asset._id),
    uploadUrl,
    timestamp,
    signature,
    apiKey,
    uploadPreset,
    publicId: cloudinaryPublicId,
    allowedFormats,
    deliveryType: "authenticated",
    resourceType: rule.resourceType,
    declaredBytes,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function finalizeOwnerLabMediaUpload({ user, slug, uploadIntentId }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (typeof uploadIntentId !== "string" || uploadIntentId.length > 64) {
    fail("MEDIA_INVALID", "A valid upload reference is required.");
  }
  await assertCustomExperiment(slug);
  await LabMediaAsset.createIndexes();

  const asset = await LabMediaAsset.findOne({
    uploadIntentId,
    experimentSlug: slug,
    ownerUserId: user.id,
  });
  if (!asset) fail("NOT_FOUND", "Upload reference not found.");
  if (asset.status === "ready") return serializeAsset(asset);
  if (asset.status !== "uploading") fail("MEDIA_INVALID", "This upload is no longer available.");
  if (!asset.expiresAt || asset.expiresAt.getTime() < Date.now()) {
    fail("MEDIA_UPLOAD_EXPIRED", "This upload expired. Start a new upload.");
  }

  const { client } = getCloudinary();
  let remote;
  try {
    remote = await client.api.resource(asset.cloudinaryPublicId, {
      resource_type: asset.resourceType,
      type: asset.deliveryType,
    });
  } catch (error) {
    if (Number(error?.http_code || error?.statusCode) === 404) {
      fail("MEDIA_NOT_READY", "Cloudinary has not received this file yet. Complete the upload and retry.");
    }
    fail("MEDIA_PROVIDER_ERROR", "Cloudinary could not verify this upload.");
  }

  const rule = FORMAT_RULES[asset.mediaKind];
  const remoteFormat = String(remote?.format || "").toLowerCase();
  const remoteType = String(remote?.type || "");
  const remoteResourceType = String(remote?.resource_type || "");
  const remoteBytes = Number(remote?.bytes || 0);
  const maxBytes = Number(process.env.LABS_MEDIA_MAX_UPLOAD_BYTES);

  if (
    remote?.public_id !== asset.cloudinaryPublicId ||
    remoteResourceType !== asset.resourceType ||
    remoteType !== "authenticated" ||
    !rule?.formats.includes(remoteFormat) ||
    !Number.isSafeInteger(remoteBytes) ||
    remoteBytes <= 0 ||
    remoteBytes > maxBytes
  ) {
    asset.status = "rejected";
    await asset.save();
    fail("MEDIA_INVALID", "The uploaded asset did not match the approved Labs media policy or configured size limit.");
  }

  const updateFields = {
    format: remoteFormat,
    byteSize: remoteBytes,
    width: Number.isFinite(Number(remote.width)) ? Number(remote.width) : null,
    height: Number.isFinite(Number(remote.height)) ? Number(remote.height) : null,
    durationSeconds: Number.isFinite(Number(remote.duration)) ? Number(remote.duration) : null,
    status: "ready",
  };
  if (typeof remote.asset_id === "string" && remote.asset_id) {
    updateFields.cloudinaryAssetId = remote.asset_id;
  }

  const finalizedAsset = await LabMediaAsset.findOneAndUpdate(
    { _id: asset._id, status: "uploading" },
    { $set: updateFields },
    { new: true, runValidators: true },
  );

  if (!finalizedAsset) {
    const latestAsset = await LabMediaAsset.findById(asset._id);
    if (latestAsset?.status === "ready") return serializeAsset(latestAsset);
    fail("CONFLICT", "This upload is already being finalized. Refresh the media library.");
  }

  await LabSourceAuditEvent.create({
    actorUserId: user.id,
    action: "media_uploaded",
    experimentSlug: slug,
    versionId: null,
    requestId: uploadIntentId,
    resultCode: "ok",
    createdAt: new Date(),
  });

  return serializeAsset(finalizedAsset);
}

export async function listOwnerLabMediaAssets({ user, slug }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  const experiment = await assertCustomExperiment(slug);
  await LabMediaAsset.createIndexes();

  const [assets, source] = await Promise.all([
    LabMediaAsset.find({
      experimentSlug: slug,
      ownerUserId: user.id,
      status: "ready",
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .lean(),
    LabSource.findOne({
      slug,
      published: true,
      publishedVersionId: { $ne: null },
      publishedArtifactId: { $ne: null },
    })
      .select("publishedVersionId publishedArtifactId")
      .lean(),
  ]);

  const galleryPreviewCurrent = Boolean(
    experiment.galleryPreview?.artifactId &&
    experiment.galleryPreview?.sourceVersionId &&
    source?.publishedArtifactId === experiment.galleryPreview.artifactId &&
    source?.publishedVersionId === experiment.galleryPreview.sourceVersionId
  );

  const attachments = new Map(
    (experiment.mediaAttachments || []).map((attachment) => [String(attachment.assetId), attachment]),
  );
  let client = null;
  if (assets.length) {
    try {
      ({ client } = getCloudinary());
    } catch {
      client = null;
    }
  }

  return assets.map((asset) => serializeAsset(
    asset,
    attachments.get(String(asset._id)) || null,
    client ? createOwnerPreviewUrl(client, asset) : null,
    String(experiment.galleryPreview?.assetId || "") === String(asset._id),
    galleryPreviewCurrent &&
      String(experiment.galleryPreview?.assetId || "") === String(asset._id),
  ));
}

export async function saveOwnerLabMediaAttachments({ user, slug, attachments: input }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (!Array.isArray(input) || input.length > 1) {
    fail("MEDIA_INVALID", "An experiment can use at most one optional fallback preview.");
  }

  const experiment = await assertCustomExperiment(slug);
  const normalized = input.map((item) => {
    const assetId = typeof item?.assetId === "string" ? item.assetId.trim() : "";
    if (!mongoose.isValidObjectId(assetId)) fail("MEDIA_INVALID", "The fallback preview references an invalid asset.");
    const roles = Array.isArray(item?.roles) ? [...new Set(item.roles)] : [];
    if (roles.length !== 1 || roles[0] !== "fallback-preview") {
      fail("MEDIA_INVALID", "Uploaded media may only be attached as an optional fallback when the code preview cannot run or is unsupported.");
    }
    const altText = typeof item?.altText === "string" ? item.altText.trim() : "";
    const caption = typeof item?.caption === "string" ? item.caption.trim() : "";
    if (altText.length > 300 || caption.length > 500) {
      fail("MEDIA_INVALID", "Fallback alt text or caption is too long.");
    }
    return {
      assetId: new mongoose.Types.ObjectId(assetId),
      roles: ["fallback-preview"],
      altText,
      caption,
    };
  });

  if (normalized.length) {
    const readyAsset = await LabMediaAsset.findOne({
      _id: normalized[0].assetId,
      experimentSlug: slug,
      ownerUserId: user.id,
      status: "ready",
    }).select("_id").lean();
    if (!readyAsset) {
      fail("MEDIA_INVALID", "The selected fallback preview is not ready or does not belong to this experiment.");
    }
  }

  await LabExperiment.updateOne(
    { _id: experiment._id, kind: "custom" },
    { $set: { mediaAttachments: normalized, updatedBy: user.id } },
    { runValidators: true },
  );

  await LabSourceAuditEvent.create({
    actorUserId: user.id,
    action: "media_attachments_updated",
    experimentSlug: slug,
    versionId: null,
    requestId: randomUUID(),
    resultCode: "ok",
    createdAt: new Date(),
  });

  return {
    attachments: normalized.map((item) => ({
      assetId: String(item.assetId),
      roles: item.roles,
      altText: item.altText,
      caption: item.caption,
    })),
    assets: await listOwnerLabMediaAssets({ user, slug }),
  };
}


export async function deleteOwnerLabMediaAssetsForExperiment({ user, slug }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  await assertCustomExperiment(slug);
  await LabMediaAsset.createIndexes();

  const assets = await LabMediaAsset.find({
    experimentSlug: slug,
    ownerUserId: user.id,
  }).lean();

  if (!assets.length) return { deletedCount: 0 };

  const { client } = getCloudinary();
  const results = await Promise.all(
    assets.map(async (asset) => {
      const result = await client.uploader.destroy(asset.cloudinaryPublicId, {
        resource_type: asset.resourceType,
        type: asset.deliveryType,
        invalidate: true,
      });
      if (!["ok", "not found"].includes(String(result?.result || "").toLowerCase())) {
        fail("MEDIA_PROVIDER_ERROR", "Cloudinary could not remove " + asset.originalFilename + ".");
      }
      return asset;
    }),
  );

  return { deletedCount: results.length };
}


const GALLERY_PREVIEW_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const GALLERY_PREVIEW_MAX_BYTES = 5 * 1024 * 1024;

function galleryPreviewMime(format) {
  return ({
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  })[format] || null;
}

function matchesImageSignature(bytes, format) {
  if (!Buffer.isBuffer(bytes)) return false;
  if (format === "jpg" || format === "jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (format === "png") {
    return bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (format === "webp") {
    return bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
  }
  if (format === "avif") {
    const box = bytes.toString("ascii", 4, 16);
    return bytes.length >= 16 && box.startsWith("ftyp") &&
      (box.includes("avif") || box.includes("avis"));
  }
  return false;
}

/**
 * Promote one owner-uploaded private still image into an immutable public
 * gallery derivative. It is bound to the exact currently published artifact
 * and source version; a later publish automatically makes this poster ineligible.
 */
export async function saveOwnerLabGalleryPreview({ user, slug, assetId, altText = "", fit = "cover" }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("NOT_FOUND", "Experiment not found.");
  }

  await connectToDatabase();
  const experiment = await LabExperiment.findOne({
    slug,
    kind: "custom",
  })
    .select("_id status galleryPreview")
    .lean();
  if (!experiment || experiment.status === "deleting") {
    fail("NOT_FOUND", "Experiment not found.");
  }

  const safeAltText = typeof altText === "string" ? altText.trim().slice(0, 300) : "";
  const safeFit = fit === "contain" ? "contain" : "cover";

  if (assetId === null || assetId === "") {
    await LabExperiment.updateOne(
      { _id: experiment._id, kind: "custom" },
      { $set: { galleryPreview: null, updatedBy: user.id } },
    );
    await LabSourceAuditEvent.create({
      actorUserId: user.id,
      action: "gallery_preview_updated",
      experimentSlug: slug,
      versionId: experiment.galleryPreview?.sourceVersionId || null,
      requestId: randomUUID(),
      resultCode: "removed",
      createdAt: new Date(),
    });
    return { galleryPreview: null };
  }

  if (typeof assetId !== "string" || !mongoose.isValidObjectId(assetId)) {
    fail("MEDIA_INVALID", "Choose a valid image from this experiment's media library.");
  }
  if (safeAltText.length > 300) {
    fail("MEDIA_INVALID", "Gallery preview alt text is too long.");
  }

  const source = await LabSource.findOne({
    slug,
    published: true,
    publishedVersionId: { $ne: null },
    publishedArtifactId: { $ne: null },
  })
    .select("publishedVersionId publishedArtifactId")
    .lean();
  if (!source) {
    fail("PUBLISH_REQUIRED", "Publish a ready source version before setting its public gallery preview.");
  }

  const artifact = await LabBuildArtifact.findOne({
    artifactId: source.publishedArtifactId,
    experimentSlug: slug,
    sourceVersionId: source.publishedVersionId,
    status: "ready",
  })
    .select("artifactId sourceVersionId")
    .lean();
  if (!artifact) {
    fail("PUBLISH_REQUIRED", "The current published build is not ready. Build and publish the exact saved source version first.");
  }

  const asset = await LabMediaAsset.findOne({
    _id: new mongoose.Types.ObjectId(assetId),
    experimentSlug: slug,
    ownerUserId: user.id,
    mediaKind: "image",
    deliveryType: "authenticated",
    status: "ready",
    format: { $in: [...GALLERY_PREVIEW_FORMATS] },
  }).lean();
  if (!asset) {
    fail("MEDIA_INVALID", "Choose a ready JPEG, PNG, WebP or AVIF image owned by this experiment. GIF and video files cannot be public gallery posters.");
  }

  const { client } = getCloudinary();
  let remote;
  try {
    remote = await client.api.resource(asset.cloudinaryPublicId, {
      resource_type: "image",
      type: "authenticated",
    });
  } catch {
    fail("MEDIA_PROVIDER_ERROR", "The private preview image could not be verified with Cloudinary.");
  }

  const format = String(remote?.format || "").toLowerCase();
  const mime = galleryPreviewMime(format);
  const remoteBytes = Number(remote?.bytes || 0);
  if (
    remote?.public_id !== asset.cloudinaryPublicId ||
    remote?.resource_type !== "image" ||
    remote?.type !== "authenticated" ||
    !mime ||
    !GALLERY_PREVIEW_FORMATS.has(format) ||
    !Number.isSafeInteger(remoteBytes) ||
    remoteBytes <= 0 ||
    remoteBytes > GALLERY_PREVIEW_MAX_BYTES
  ) {
    fail("MEDIA_INVALID", "The image did not pass the public gallery poster format or 5 MB size policy.");
  }

  const privateUrl = createOwnerPreviewUrl(client, {
    ...asset,
    format,
  });
  if (!privateUrl) fail("MEDIA_PROVIDER_ERROR", "A temporary private image URL could not be created.");

  let download;
  try {
    download = await fetch(privateUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    fail("MEDIA_PROVIDER_ERROR", "Cloudinary could not deliver the private image for safe promotion.");
  }
  if (!download.ok) {
    fail("MEDIA_PROVIDER_ERROR", "Cloudinary could not deliver the private image for safe promotion.");
  }

  const contentLength = Number(download.headers.get("content-length") || 0);
  if (contentLength > GALLERY_PREVIEW_MAX_BYTES) {
    fail("MEDIA_INVALID", "The gallery preview image exceeds the 5 MB size limit.");
  }

  let bytes;
  try {
    bytes = Buffer.from(await download.arrayBuffer());
  } catch {
    fail("MEDIA_PROVIDER_ERROR", "The private image could not be read.");
  }
  if (
    bytes.length === 0 ||
    bytes.length > GALLERY_PREVIEW_MAX_BYTES ||
    bytes.length !== remoteBytes ||
    !matchesImageSignature(bytes, format)
  ) {
    fail("MEDIA_INVALID", "The downloaded image did not match Cloudinary's verified format and size.");
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    fail("ARTIFACT_STORAGE_NOT_CONFIGURED", "Public gallery image storage is not configured.");
  }

  let stored;
  try {
    stored = await put(
      ["labs", slug, "gallery", artifact.artifactId, randomUUID() + "." + format].join("/"),
      bytes,
      {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: mime,
      },
    );
  } catch {
    fail("ARTIFACT_STORAGE_ERROR", "The public gallery image could not be stored.");
  }

  let publicUrl;
  try {
    publicUrl = new URL(stored.url);
  } catch {
    fail("ARTIFACT_STORAGE_ERROR", "The gallery image provider returned an invalid public URL.");
  }
  if (
    publicUrl.protocol !== "https:" ||
    !publicUrl.hostname.endsWith(".public.blob.vercel-storage.com")
  ) {
    fail("ARTIFACT_STORAGE_ERROR", "The gallery image provider returned an unsupported public URL.");
  }

  const galleryPreview = {
    assetId: asset._id,
    src: publicUrl.toString(),
    alt: safeAltText,
    fit: safeFit,
    artifactId: artifact.artifactId,
    sourceVersionId: artifact.sourceVersionId,
    createdAt: new Date(),
  };

  // This pointer may become stale if a publish races the promotion. The
  // public DTO checks both immutable IDs before rendering it, so it will
  // never bind to a different release.
  await LabExperiment.updateOne(
    { _id: experiment._id, kind: "custom" },
    { $set: { galleryPreview, updatedBy: user.id } },
  );

  await LabSourceAuditEvent.create({
    actorUserId: user.id,
    action: "gallery_preview_updated",
    experimentSlug: slug,
    versionId: artifact.sourceVersionId,
    requestId: randomUUID(),
    resultCode: "ok",
    createdAt: new Date(),
  });

  return {
    galleryPreview: {
      src: galleryPreview.src,
      alt: galleryPreview.alt,
      fit: galleryPreview.fit,
      artifactId: galleryPreview.artifactId,
      sourceVersionId: galleryPreview.sourceVersionId,
    },
  };
}
