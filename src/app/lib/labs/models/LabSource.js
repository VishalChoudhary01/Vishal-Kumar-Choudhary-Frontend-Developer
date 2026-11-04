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
      default: "0.0",
      maxlength: 80,
    },
    draftVersionId: {
      type: String,
      default: null,
      maxlength: 64,
    },
    publishedVersionId: {
      type: String,
      default: null,
      maxlength: 64,
    },
    nextVersionNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    createdBy: {
      type: String,
      default: null,
      maxlength: 128,
    },
    updatedBy: {
      type: String,
      default: null,
      maxlength: 128,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    files: {
      type: [labSourceFileSchema],
      default: [],
      validate: {
        validator: (files) => Array.isArray(files) && files.length <= 40,
        message: "A source snapshot cannot contain more than 40 files.",
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
