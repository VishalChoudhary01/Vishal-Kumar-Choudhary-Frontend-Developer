import "server-only";

import mongoose from "mongoose";

const EVENT_TYPES = [
  "source_open",
  "code_copy",
  "like",
  "unlike",
  "guest_like",
  "guest_unlike",
];

const labAnalyticsEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    eventType: {
      type: String,
      required: true,
      enum: EVENT_TYPES,
    },
    experimentSlug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    actorCategory: {
      type: String,
      required: true,
      enum: ["verified_user", "guest"],
    },
    actorUserId: {
      type: String,
      default: null,
      maxlength: 128,
    },
    sourceVersion: {
      type: String,
      default: null,
      maxlength: 80,
    },
    filePath: {
      type: String,
      default: null,
      maxlength: 180,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: "lab_analytics_events",
    strict: "throw",
    versionKey: false,
  },
);

labAnalyticsEventSchema.index(
  { eventId: 1 },
  { unique: true, name: "lab_analytics_event_id_unique" },
);
labAnalyticsEventSchema.index(
  { experimentSlug: 1, occurredAt: -1 },
  { name: "lab_analytics_experiment_date" },
);
labAnalyticsEventSchema.index(
  { eventType: 1, occurredAt: -1 },
  { name: "lab_analytics_type_date" },
);
labAnalyticsEventSchema.index(
  { actorUserId: 1, occurredAt: -1 },
  {
    name: "lab_analytics_verified_actor_date",
    partialFilterExpression: { actorCategory: "verified_user" },
  },
);

const LabAnalyticsEvent =
  mongoose.models.LabAnalyticsEvent ||
  mongoose.model("LabAnalyticsEvent", labAnalyticsEventSchema);

export default LabAnalyticsEvent;
