import "server-only";

import mongoose from "mongoose";

const labSourceVersionFileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500000,
    },
  },
  { _id: false, strict: "throw" },
);

const labSourceVersionSchema = new mongoose.Schema(
  {
    versionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxlength: 64,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    experimentSlug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    version: {
      type: String,
      required: true,
      maxlength: 80,
    },
    files: {
      type: [labSourceVersionFileSchema],
      required: true,
      validate: {
        validator: (files) => Array.isArray(files) && files.length > 0 && files.length <= 40,
        message: "A source version must contain between 1 and 40 files.",
      },
    },
    contentHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
    },
    buildArtifactId: { type: String, default: null, maxlength: 64 },
    buildHash: { type: String, default: null, match: /^[a-f0-9]{64}$/ },
    basedOnVersionId: {
      type: String,
      default: null,
      maxlength: 64,
    },
    changeSummary: {
      type: String,
      default: "",
      maxlength: 500,
    },
    createdBy: {
      type: String,
      required: true,
      maxlength: 128,
    },
  },
  {
    collection: "lab_source_versions",
    timestamps: { createdAt: true, updatedAt: false },
    strict: "throw",
    versionKey: false,
  },
);

labSourceVersionSchema.index(
  { sourceId: 1, versionNumber: 1 },
  { unique: true, name: "lab_source_version_source_number_unique" },
);
labSourceVersionSchema.index(
  { experimentSlug: 1, createdAt: -1 },
  { name: "lab_source_version_experiment_date" },
);

const LabSourceVersion =
  mongoose.models.LabSourceVersion ||
  mongoose.model("LabSourceVersion", labSourceVersionSchema);

export default LabSourceVersion;
