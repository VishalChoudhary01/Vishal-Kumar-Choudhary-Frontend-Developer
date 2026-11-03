import "server-only";

import mongoose from "mongoose";

const labSourceFileSchema = new mongoose.Schema(
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

const labSourceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    version: {
      type: String,
      required: true,
      maxlength: 80,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    files: {
      type: [labSourceFileSchema],
      required: true,
      validate: {
        validator: (files) =>
          Array.isArray(files) && files.length > 0 && files.length <= 40,
        message: "A source snapshot must contain between 1 and 40 files.",
      },
    },
  },
  {
    collection: "lab_sources",
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

const LabSource =
  mongoose.models.LabSource ||
  mongoose.model("LabSource", labSourceSchema);

export default LabSource;
