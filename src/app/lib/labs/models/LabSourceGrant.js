import "server-only";

import mongoose from "mongoose";

const labSourceGrantSchema = new mongoose.Schema(
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
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    grantedBy: {
      type: String,
      trim: true,
      maxlength: 128,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "lab_source_grants",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labSourceGrantSchema.index(
  { userId: 1, experimentSlug: 1 },
  { unique: true, name: "lab_source_grant_user_experiment_unique" },
);

const LabSourceGrant =
  mongoose.models.LabSourceGrant ||
  mongoose.model("LabSourceGrant", labSourceGrantSchema);

export default LabSourceGrant;
