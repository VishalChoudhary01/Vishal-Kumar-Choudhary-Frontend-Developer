import "server-only";

import mongoose from "mongoose";

const labSourceAuditEventSchema = new mongoose.Schema(
  {
    actorUserId: { type: String, required: true, maxlength: 128 },
    action: {
      type: String,
      required: true,
      enum: [
        "source_created",
        "experiment_created",
        "draft_saved",
        "source_published",
        "source_unpublished",
        "version_restored",
        "validation_failed",
      ],
    },
    experimentSlug: { type: String, required: true, maxlength: 100 },
    versionId: { type: String, default: null, maxlength: 64 },
    requestId: { type: String, default: null, maxlength: 100 },
    resultCode: { type: String, default: "ok", maxlength: 60 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  {
    collection: "lab_source_audit_events",
    strict: "throw",
    versionKey: false,
  },
);

labSourceAuditEventSchema.index(
  { experimentSlug: 1, createdAt: -1 },
  { name: "lab_source_audit_experiment_date" },
);

const LabSourceAuditEvent =
  mongoose.models.LabSourceAuditEvent ||
  mongoose.model("LabSourceAuditEvent", labSourceAuditEventSchema);

export default LabSourceAuditEvent;
