import "server-only";

import mongoose from "mongoose";

const labAnalyticsHiddenExperimentSchema = new mongoose.Schema(
  {
    experimentSlug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    experimentTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    hiddenBy: {
      type: String,
      required: true,
      maxlength: 128,
    },
    hiddenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: "lab_analytics_hidden_experiments",
    strict: "throw",
    versionKey: false,
  },
);

labAnalyticsHiddenExperimentSchema.index(
  { experimentSlug: 1 },
  { unique: true, name: "lab_analytics_hidden_experiment_slug_unique" },
);
labAnalyticsHiddenExperimentSchema.index(
  { hiddenAt: -1 },
  { name: "lab_analytics_hidden_experiment_date" },
);

const LabAnalyticsHiddenExperiment =
  mongoose.models.LabAnalyticsHiddenExperiment ||
  mongoose.model("LabAnalyticsHiddenExperiment", labAnalyticsHiddenExperimentSchema);

export default LabAnalyticsHiddenExperiment;
