import "server-only";

import mongoose from "mongoose";

const MEDIA_ATTACHMENT_ROLES = ["fallback-preview"];

const labMediaAttachmentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    roles: {
      type: [{ type: String, enum: MEDIA_ATTACHMENT_ROLES }],
      required: true,
      validate: {
        validator: (roles) => Array.isArray(roles) && roles.length === 1 && roles[0] === "fallback-preview",
        message: "Media may only be attached as an optional fallback preview.",
      },
    },
    altText: { type: String, default: "", trim: true, maxlength: 300 },
    caption: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false, strict: "throw" },
);

const labExperimentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    explanation: { type: String, default: "", trim: true, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: [
        "Motion & Animation",
        "CSS Experiments",
        "Interface Interactions",
        "Creative Coding",
      ],
    },
    technologies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => Array.isArray(items) && items.length <= 8,
        message: "An experiment can list at most eight technologies.",
      },
    },
    kind: { type: String, required: true, enum: ["custom"], default: "custom" },
    mediaAttachments: {
      type: [labMediaAttachmentSchema],
      default: [],
      validate: {
        validator: (attachments) => Array.isArray(attachments) && attachments.length <= 1,
        message: "An experiment can have at most one optional fallback preview.",
      },
    },
    // Public, static gallery artwork is separate from private runtime-fallback
    // media. The artifact/version binding prevents an old poster from being
    // displayed after a different source version is published.
    galleryPreview: {
      assetId: { type: mongoose.Schema.Types.ObjectId, default: null },
      src: { type: String, default: null, maxlength: 2048 },
      alt: { type: String, default: "", trim: true, maxlength: 300 },
      mediaKind: { type: String, enum: ["image", "video"], default: "image" },
      contentType: { type: String, enum: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "video/mp4", "video/webm"], default: "image/jpeg" },
      fit: { type: String, enum: ["cover", "contain"], default: "contain" },
      width: { type: Number, default: null, min: 1, max: 20000 },
      height: { type: Number, default: null, min: 1, max: 20000 },
      artifactId: { type: String, default: null, maxlength: 64 },
      sourceVersionId: { type: String, default: null, maxlength: 64 },
      createdAt: { type: Date, default: null },
    },
    status: { type: String, required: true, enum: ["draft", "published", "deleting"], default: "draft", index: true },
    createdBy: { type: String, required: true, maxlength: 128 },
    updatedBy: { type: String, required: true, maxlength: 128 },
    publishedAt: { type: Date, default: null },
  },
  {
    collection: "lab_experiments",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labExperimentSchema.index(
  { status: 1, updatedAt: -1 },
  { name: "lab_experiments_status_updated" },
);

const LabExperiment =
  mongoose.models.LabExperiment ||
  mongoose.model("LabExperiment", labExperimentSchema);

export default LabExperiment;
