import "server-only";

import mongoose from "mongoose";

const labPreviewRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true, index: true, maxlength: 64 },
    experimentSlug: { type: String, required: true, index: true, maxlength: 80 },
    ownerUserId: { type: String, required: true, index: true, maxlength: 128 },
    sandboxName: { type: String, required: true, maxlength: 128 },
    previewUrl: { type: String, required: true, maxlength: 2048 },
    sourceContentHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    status: { type: String, enum: ["ready", "failed"], required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: "lab_preview_runs",
    timestamps: { createdAt: true, updatedAt: false },
    strict: "throw",
    versionKey: false,
  },
);

labPreviewRunSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "lab_preview_run_ttl" },
);

const LabPreviewRun =
  mongoose.models.LabPreviewRun ||
  mongoose.model("LabPreviewRun", labPreviewRunSchema);

export default LabPreviewRun;
