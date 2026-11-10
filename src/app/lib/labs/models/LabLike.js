import "server-only";

import mongoose from "mongoose";

const labLikeSchema = new mongoose.Schema(
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
    lastTransitionAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "lab_likes",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labLikeSchema.index(
  { userId: 1, experimentSlug: 1 },
  { unique: true, name: "lab_like_user_experiment_unique" },
);
labLikeSchema.index(
  { experimentSlug: 1, active: 1 },
  { name: "lab_like_experiment_active" },
);

const LabLike =
  mongoose.models.LabLike || mongoose.model("LabLike", labLikeSchema);

export default LabLike;
