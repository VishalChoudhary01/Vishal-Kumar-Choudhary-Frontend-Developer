import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { LAB_CATEGORIES, publishedLabExperiments } from "@/app/data/labsExperiments";
import { isLabsOwner } from "./owner-access";
import LabExperiment from "./models/LabExperiment";
import LabSource from "./models/LabSource";
import LabSourceAuditEvent from "./models/LabSourceAuditEvent";
import LabSourceVersion from "./models/LabSourceVersion";
import LabMediaAsset from "./models/LabMediaAsset";
import LabBuildArtifact from "./models/LabBuildArtifact";
import LabPreviewRun from "./models/LabPreviewRun";
import LabSourceGrant from "./models/LabSourceGrant";
import LabAnalyticsEvent from "./models/LabAnalyticsEvent";
import LabLike from "./models/LabLike";
import LabGuestLike from "./models/LabGuestLike";
import { del } from "@vercel/blob";
import { deleteOwnerLabMediaAssetsForExperiment } from "./media-management";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function validateExperimentMetadata(input, { strictTechnologies = false } = {}) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const description = typeof input?.description === "string" ? input.description.trim() : "";
  const explanation = typeof input?.explanation === "string" ? input.explanation.trim() : "";
  const category = typeof input?.category === "string" ? input.category.trim() : "";

  if (!title || title.length > 100) {
    fail("VALIDATION_ERROR", "Enter a title between 1 and 100 characters.");
  }
  if (!description || description.length > 500) {
    fail("VALIDATION_ERROR", "Enter a description between 1 and 500 characters.");
  }
  if (explanation.length > 2000) {
    fail("VALIDATION_ERROR", "The explanation must be 2,000 characters or fewer.");
  }
  if (!LAB_CATEGORIES.some((item) => item.name === category)) {
    fail("VALIDATION_ERROR", "Choose one of the available Labs categories.");
  }
  if (
    strictTechnologies &&
    (!Array.isArray(input?.technologies) || input.technologies.some((item) => typeof item !== "string"))
  ) {
    fail("VALIDATION_ERROR", "Technologies must be provided as a list of text values.");
  }

  const technologies = Array.isArray(input?.technologies)
    ? input.technologies
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const uniqueTechnologies = [...new Set(technologies)];
  if (uniqueTechnologies.length > 8 || uniqueTechnologies.some((item) => item.length > 32)) {
    fail("VALIDATION_ERROR", "Add up to eight technologies, each 32 characters or fewer.");
  }

  return {
    title,
    description,
    explanation,
    category,
    technologies: uniqueTechnologies,
  };
}

function validateInput(input, user) {
  const metadata = validateExperimentMetadata(input);
  const requestedSlug = typeof input?.slug === "string" ? input.slug.trim().toLowerCase() : "";
  const slug = requestedSlug || slugify(metadata.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    fail("VALIDATION_ERROR", "Use a slug with lowercase letters, numbers and single hyphens.");
  }

  if (publishedLabExperiments.some((item) => item.slug === slug)) {
    fail("CONFLICT", "That slug is reserved by an existing Labs experiment.");
  }

  return {
    slug,
    ...metadata,
    kind: "custom",
    status: "draft",
    createdBy: user.id,
    updatedBy: user.id,
    publishedAt: null,
  };
}

export async function createOwnerLabExperiment({ user, input }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");

  const experiment = validateInput(input, user);
  await connectToDatabase();
  await Promise.all([
    LabExperiment.createIndexes(),
    LabSource.createIndexes(),
    LabSourceAuditEvent.createIndexes(),
  ]);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await LabExperiment.create([experiment], { session });

      const [source] = await LabSource.create(
        [{
          slug: experiment.slug,
          version: "0.0",
          published: false,
          files: [],
          draftVersionId: null,
          publishedVersionId: null,
          nextVersionNumber: 1,
          createdBy: user.id,
          updatedBy: user.id,
        }],
        { session },
      );

      await LabSourceAuditEvent.create(
        [{
          actorUserId: user.id,
          action: "experiment_created",
          experimentSlug: experiment.slug,
          versionId: null,
          requestId: null,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );

      if (!source) fail("UNAVAILABLE", "The source workspace could not be created.");
    });

    return {
      slug: experiment.slug,
      title: experiment.title,
      category: experiment.category,
      status: "draft",
      workspaceUrl: "/admin/labs/sources/" + encodeURIComponent(experiment.slug),
    };
  } catch (error) {
    if (error?.code === 11000) {
      fail("CONFLICT", "An experiment with this slug already exists. Choose another slug.");
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

function serializeOwnerExperiment(experiment) {
  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    explanation: experiment.explanation || "",
    category: experiment.category,
    technologies: Array.isArray(experiment.technologies) ? experiment.technologies : [],
    status: experiment.status,
    updatedAt: experiment.updatedAt?.toISOString?.() || null,
  };
}

export async function getOwnerLabExperiment({ user, slug }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("NOT_FOUND", "Owner-created experiment not found.");
  }
  if (publishedLabExperiments.some((item) => item.slug === slug)) {
    fail("NOT_FOUND", "Owner-created experiment not found.");
  }

  await connectToDatabase();
  const experiment = await LabExperiment.findOne({
    slug,
    kind: "custom",
    status: { $ne: "deleting" },
  })
    .select("slug title description explanation category technologies status updatedAt")
    .lean();

  if (!experiment) fail("NOT_FOUND", "Owner-created experiment not found.");
  return serializeOwnerExperiment(experiment);
}

export async function updateOwnerLabExperimentMetadata({
  user,
  slug,
  input,
  expectedUpdatedAt,
  requestId = null,
}) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("NOT_FOUND", "Owner-created experiment not found.");
  }
  if (publishedLabExperiments.some((item) => item.slug === slug)) {
    fail("FORBIDDEN", "Built-in Labs experiment details cannot be edited here.");
  }

  if (typeof expectedUpdatedAt !== "string" || !expectedUpdatedAt.trim()) {
    fail("VALIDATION_ERROR", "Reload the experiment before saving its details.");
  }
  const expectedDate = new Date(expectedUpdatedAt);
  if (!Number.isFinite(expectedDate.getTime())) {
    fail("VALIDATION_ERROR", "The experiment update token is invalid.");
  }

  const metadata = validateExperimentMetadata(input, { strictTechnologies: true });
  const safeRequestId =
    typeof requestId === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(requestId)
      ? requestId
      : null;

  await connectToDatabase();
  await Promise.all([
    LabExperiment.createIndexes(),
    LabSourceAuditEvent.createIndexes(),
  ]);

  const session = await mongoose.startSession();
  let updatedExperiment;

  try {
    await session.withTransaction(async () => {
      const current = await LabExperiment.findOne({
        slug,
        kind: "custom",
        status: { $ne: "deleting" },
      })
        .select("slug updatedAt")
        .session(session)
        .lean();

      if (!current) fail("NOT_FOUND", "Owner-created experiment not found.");
      if (new Date(current.updatedAt).getTime() !== expectedDate.getTime()) {
        fail("CONFLICT", "This experiment was updated elsewhere. Reload before saving your changes.");
      }

      const nextUpdatedAt = new Date(
        Math.max(Date.now(), new Date(current.updatedAt).getTime() + 1),
      );
      const result = await LabExperiment.updateOne(
        {
          _id: current._id,
          kind: "custom",
          status: { $ne: "deleting" },
          updatedAt: current.updatedAt,
        },
        {
          $set: {
            ...metadata,
            updatedBy: user.id,
            updatedAt: nextUpdatedAt,
          },
        },
        { session, runValidators: true, timestamps: false },
      );

      if (result.modifiedCount !== 1) {
        fail("CONFLICT", "This experiment changed while you were saving. Reload and try again.");
      }

      updatedExperiment = await LabExperiment.findById(current._id)
        .select("slug title description explanation category technologies status updatedAt")
        .session(session)
        .lean();

      await LabSourceAuditEvent.create(
        [{
          actorUserId: user.id,
          action: "experiment_metadata_updated",
          experimentSlug: slug,
          versionId: null,
          requestId: safeRequestId,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return serializeOwnerExperiment(updatedExperiment);
}



export async function deleteOwnerLabExperiment({ user, slug, confirmSlug }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("NOT_FOUND", "Experiment not found.");
  }
  if (confirmSlug !== slug) {
    fail("VALIDATION_ERROR", "Type the exact experiment slug to confirm deletion.");
  }
  if (publishedLabExperiments.some((item) => item.slug === slug)) {
    fail("FORBIDDEN", "Built-in Labs experiments cannot be deleted.");
  }

  await connectToDatabase();
  const experiment = await LabExperiment.findOne({ slug, kind: "custom" }).lean();
  if (!experiment) fail("NOT_FOUND", "Owner-created experiment not found.");

  // Hide the experiment and revoke its source before touching external providers.
  await Promise.all([
    LabExperiment.updateOne(
      { _id: experiment._id, kind: "custom" },
      { $set: { status: "deleting", updatedBy: user.id } },
    ),
    LabSource.updateOne(
      { slug },
      { $set: { published: false, publishedVersionId: null, publishedArtifactId: null, updatedBy: user.id } },
    ),
  ]);

  // Provider cleanup is idempotent. A failure leaves the record in deleting
  // so the owner can retry rather than exposing a partially deleted release.
  await deleteOwnerLabMediaAssetsForExperiment({ user, slug });

  const artifacts = await LabBuildArtifact.find({ experimentSlug: slug })
    .select("outputFiles")
    .lean();
  const blobUrls = [...new Set([
    ...artifacts.flatMap((artifact) =>
      (artifact.outputFiles || [])
        .map((file) => file?.url)
        .filter((url) => typeof url === "string" && /^https:\/\//.test(url)),
    ),
    ...(typeof experiment.galleryPreview?.src === "string" &&
    /^https:\/\//.test(experiment.galleryPreview.src)
      ? [experiment.galleryPreview.src]
      : []),
  ])];

  if (blobUrls.length) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) fail("ARTIFACT_STORAGE_NOT_CONFIGURED", "Published runtime storage is not configured; retry deletion after restoring BLOB_READ_WRITE_TOKEN.");
    await del(blobUrls, { token });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const filters = { experimentSlug: slug };
      await LabSourceVersion.deleteMany(filters, { session });
      await LabMediaAsset.deleteMany({ experimentSlug: slug, ownerUserId: user.id }, { session });
      await LabBuildArtifact.deleteMany(filters, { session });
      await LabPreviewRun.deleteMany(filters, { session });
      await LabSourceGrant.deleteMany(filters, { session });
      await LabAnalyticsEvent.deleteMany(filters, { session });
      await LabLike.deleteMany(filters, { session });
      await LabGuestLike.deleteMany(filters, { session });
      await LabSourceAuditEvent.deleteMany(filters, { session });
      await LabSource.deleteOne({ slug }, { session });
      await LabExperiment.deleteOne({ _id: experiment._id, kind: "custom" }, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    deleted: true,
    slug,
    deletedArtifactFiles: blobUrls.length,
  };
}
