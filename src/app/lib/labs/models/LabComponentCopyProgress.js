import "server-only";

import mongoose from "mongoose";

const MAX_FILES = 40;

const labComponentCopyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    experimentSlug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    sourceVersionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    sourceVersion: {
      type: String,
      required: true,
      maxlength: 80,
    },
    manifestHash: {
      type: String,
      required: true,
      maxlength: 4096,
    },
    requiredFilePaths: {
      type: [String],
      required: true,
      validate: {
        validator: (paths) =>
          Array.isArray(paths) &&
          paths.length >= 1 &&
          paths.length <= MAX_FILES &&
          paths.every((path) => typeof path === "string" && path.length > 0 && path.length <= 180),
        message: "A component bundle must contain between 1 and 40 valid file paths.",
      },
    },
    copiedFilePaths: {
      type: [String],
      default: [],
      validate: {
        validator: (paths) =>
          Array.isArray(paths) &&
          paths.length <= MAX_FILES &&
          paths.every((path) => typeof path === "string" && path.length > 0 && path.length <= 180),
        message: "Copied component file paths are invalid.",
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "lab_component_copy_progress",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labComponentCopyProgressSchema.index(
  { userId: 1, experimentSlug: 1, sourceVersionId: 1 },
  { unique: true, name: "lab_component_copy_actor_version_unique" },
);
labComponentCopyProgressSchema.index(
  { experimentSlug: 1, completedAt: 1 },
  { name: "lab_component_copy_experiment_completed" },
);

const LabComponentCopyProgress =
  mongoose.models.LabComponentCopyProgress ||
  mongoose.model("LabComponentCopyProgress", labComponentCopyProgressSchema);

export default LabComponentCopyProgress;
