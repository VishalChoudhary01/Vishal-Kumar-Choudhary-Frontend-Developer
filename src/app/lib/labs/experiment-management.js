import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { LAB_CATEGORIES, publishedLabExperiments } from "@/app/data/labsExperiments";
import { isLabsOwner } from "./owner-access";
import LabExperiment from "./models/LabExperiment";
import LabSource from "./models/LabSource";
import LabSourceAuditEvent from "./models/LabSourceAuditEvent";

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

function validateInput(input) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const description = typeof input?.description === "string" ? input.description.trim() : "";
  const explanation = typeof input?.explanation === "string" ? input.explanation.trim() : "";
  const category = typeof input?.category === "string" ? input.category.trim() : "";

  if (!title || title.length > 100) fail("VALIDATION_ERROR", "Enter a title between 1 and 100 characters.");
  if (!description || description.length > 500) fail("VALIDATION_ERROR", "Enter a description between 1 and 500 characters.");
  if (explanation.length > 2000) fail("VALIDATION_ERROR", "The explanation must be 2,000 characters or fewer.");
  if (!LAB_CATEGORIES.some((item) => item.name === category)) {
    fail("VALIDATION_ERROR", "Choose one of the available Labs categories.");
  }

  const requestedSlug = typeof input?.slug === "string" ? input.slug.trim().toLowerCase() : "";
  const slug = requestedSlug || slugify(title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    fail("VALIDATION_ERROR", "Use a slug with lowercase letters, numbers and single hyphens.");
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

  if (publishedLabExperiments.some((item) => item.slug === slug)) {
    fail("CONFLICT", "That slug is reserved by an existing Labs experiment.");
  }

  return {
    slug,
    title,
    description,
    explanation,
    category,
    technologies: uniqueTechnologies,
    kind: "custom",
    status: "draft",
    createdBy: user.id,
    updatedBy: user.id,
    publishedAt: null,
  };
}

export async function createOwnerLabExperiment({ user, input }) {
  if (!isLabsOwner(user)) fail("OWNER_ACCESS_DENIED", "Owner access is required.");

  const experiment = validateInput(input);
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
