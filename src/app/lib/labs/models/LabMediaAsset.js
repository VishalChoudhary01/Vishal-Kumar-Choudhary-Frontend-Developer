import "server-only";

import mongoose from "mongoose";

const labMediaAssetSchema = new mongoose.Schema(
  {
    uploadIntentId: { type: String, required: true, unique: true, index: true, maxlength: 64 },
    experimentSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true,
    },
    ownerUserId: { type: String, required: true, maxlength: 128, index: true },
    originalFilename: { type: String, required: true, maxlength: 180 },
    mediaKind: { type: String, required: true, enum: ["image", "video"] },
    resourceType: { type: String, required: true, enum: ["image", "video"] },
    deliveryType: { type: String, required: true, enum: ["authenticated"], default: "authenticated" },
    cloudinaryPublicId: { type: String, required: true, unique: true, maxlength: 255 },
    cloudinaryAssetId: { type: String, unique: true, sparse: true, maxlength: 128 },
    format: { type: String, default: null, maxlength: 16 },
    byteSize: { type: Number, default: null, min: 0 },
    width: { type: Number, default: null, min: 0 },
    height: { type: Number, default: null, min: 0 },
    durationSeconds: { type: Number, default: null, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["uploading", "ready", "rejected"],
      default: "uploading",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    altText: { type: String, default: "", trim: true, maxlength: 300 },
    caption: { type: String, default: "", trim: true, maxlength: 500 },
  },
  {
    collection: "lab_media_assets",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labMediaAssetSchema.index(
  { experimentSlug: 1, ownerUserId: 1, status: 1, createdAt: -1 },
  { name: "lab_media_asset_owner_experiment_status_date" },
);

const LabMediaAsset =
  mongoose.models.LabMediaAsset ||
  mongoose.model("LabMediaAsset", labMediaAssetSchema);

export default LabMediaAsset;
