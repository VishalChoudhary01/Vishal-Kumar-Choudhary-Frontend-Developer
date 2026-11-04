import "server-only";

import mongoose from "mongoose";

const labGuestLikeSchema = new mongoose.Schema(
  {
    guestKeyHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
      select: false,
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
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "lab_guest_likes",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labGuestLikeSchema.index(
  { guestKeyHash: 1, experimentSlug: 1 },
  { unique: true, name: "lab_guest_like_browser_experiment_unique" },
);
labGuestLikeSchema.index(
  { experimentSlug: 1, active: 1, expiresAt: 1 },
  { name: "lab_guest_like_experiment_active_expiry" },
);
labGuestLikeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "lab_guest_like_expiry" },
);

const LabGuestLike =
  mongoose.models.LabGuestLike ||
  mongoose.model("LabGuestLike", labGuestLikeSchema);

export default LabGuestLike;
