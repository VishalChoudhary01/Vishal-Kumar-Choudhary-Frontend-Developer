import "server-only";

import mongoose from "mongoose";

const labExperimentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    explanation: { type: String, default: "", trim: true, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: [
        "Motion & Animation",
        "CSS Experiments",
        "Interface Interactions",
        "Creative Coding",
      ],
    },
    technologies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => Array.isArray(items) && items.length <= 8,
        message: "An experiment can list at most eight technologies.",
      },
    },
    kind: { type: String, required: true, enum: ["custom"], default: "custom" },
    status: { type: String, required: true, enum: ["draft", "published"], default: "draft", index: true },
    createdBy: { type: String, required: true, maxlength: 128 },
    updatedBy: { type: String, required: true, maxlength: 128 },
    publishedAt: { type: Date, default: null },
  },
  {
    collection: "lab_experiments",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

labExperimentSchema.index(
  { status: 1, updatedAt: -1 },
  { name: "lab_experiments_status_updated" },
);

const LabExperiment =
  mongoose.models.LabExperiment ||
  mongoose.model("LabExperiment", labExperimentSchema);

export default LabExperiment;
