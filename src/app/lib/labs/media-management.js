import "server-only";

import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabExperiment from "./models/LabExperiment";
import LabMediaAsset from "./models/LabMediaAsset";
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
    .select("slug mediaAttachments")
    .lean();
  if (!experiment) fail("NOT_FOUND", "Experiment not found.");
  return experiment;
}

function serializeAsset(asset, attachment = null, previewUrl = null) {
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

  const assets = await LabMediaAsset.find({
    experimentSlug: slug,
    ownerUserId: user.id,
    status: "ready",
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(100)
    .lean();

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
