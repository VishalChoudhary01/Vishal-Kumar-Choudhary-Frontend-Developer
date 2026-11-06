import "server-only";

import mongoose from "mongoose";

const labBuildOutputSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, maxlength: 180 },
    url: { type: String, required: true, maxlength: 2048 },
    contentType: { type: String, required: true, maxlength: 120 },
    byteSize: { type: Number, required: true, min: 0 },
  },
  { _id: false, strict: "throw" },
);

const labPreviewPosterSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["ready", "unavailable"], required: true },
    path: { type: String, default: null, enum: [null, "__preview/gallery-poster.png"] },
    url: { type: String, default: null, maxlength: 2048 },
    contentType: { type: String, default: null, enum: [null, "image/png"] },
    byteSize: { type: Number, default: null, min: 1, max: 8 * 1024 * 1024 },
    width: { type: Number, default: null, min: 1, max: 1200 },
    height: { type: Number, default: null, min: 1, max: 900 },
    contentHash: { type: String, default: null, match: /^[a-f0-9]{64}$/ },
    captureVersion: { type: String, required: true, maxlength: 40 },
    browserVersion: { type: String, default: null, maxlength: 160 },
    reasonCode: { type: String, default: null, enum: [null, "browser_unavailable", "capture_timeout", "capture_failed", "no_visible_output", "invalid_output", "browser_unpinned"] },
  },
  { _id: false, strict: "throw" },
);

const labBuildArtifactSchema = new mongoose.Schema(
  {
    artifactId: { type: String, required: true, unique: true, index: true, maxlength: 64 },
    experimentSlug: { type: String, required: true, index: true, maxlength: 80 },
    sourceVersionId: { type: String, required: true, index: true, maxlength: 64 },
    sourceContentHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    buildHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    entryUrl: { type: String, required: true, maxlength: 2048 },
    outputFiles: {
      type: [labBuildOutputSchema],
      required: true,
      validate: (files) => Array.isArray(files) && files.length >= 1 && files.length <= 80,
    },
    // Generated from this exact immutable artifact; separate from outputFiles
    // so the compiled-file count and runtime manifest stay intact.
    previewPoster: { type: labPreviewPosterSchema, default: null },
    compiler: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdBy: { type: String, required: true, maxlength: 128 },
    status: { type: String, enum: ["ready"], required: true, default: "ready" },
  },
  {
    collection: "lab_build_artifacts",
    timestamps: { createdAt: true, updatedAt: false },
    strict: "throw",
    versionKey: false,
  },
);

labBuildArtifactSchema.index(
  { experimentSlug: 1, sourceVersionId: 1, createdAt: -1 },
  { name: "lab_build_artifact_source_version" },
);

const LabBuildArtifact =
  mongoose.models.LabBuildArtifact ||
  mongoose.model("LabBuildArtifact", labBuildArtifactSchema);

export default LabBuildArtifact;
