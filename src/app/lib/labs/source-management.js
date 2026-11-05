import "server-only";

import { createHash, randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { publishedLabExperiments } from "@/app/data/labsExperiments";
import LabSource from "./models/LabSource";
import LabExperiment from "./models/LabExperiment";
import LabSourceVersion from "./models/LabSourceVersion";
import LabSourceAuditEvent from "./models/LabSourceAuditEvent";
import LabBuildArtifact from "./models/LabBuildArtifact";
import { isLabsOwner } from "./owner-access";

const SAFE_SOURCE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;
const LANGUAGES = new Set([
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "css",
  "html",
  "json",
  "markdown",
  "text",
  "svg",
]);
const SECRET_FILE = /(^|\/)\.env(?:\.|$)|(^|\/)(?:id_rsa|id_ed25519|credentials(?:\.json)?|secrets?\.(?:json|ya?ml))$/i;
const SECRET_CONTENT = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-[A-Za-z0-9_-]{24,}\b/,
  /mongodb(?:\+srv)?:\/\/[^/\s:@]+:[^@\s]+@/i,
];

function throwCode(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function assertOwner(user) {
  if (!isLabsOwner(user)) {
    throwCode("OWNER_ACCESS_DENIED", "Owner access is required.");
  }
}

async function getExperiment(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throwCode("NOT_FOUND", "Experiment not found.");
  }

  const builtIn = publishedLabExperiments.find((item) => item.slug === slug);
  if (builtIn) return { ...builtIn, isCustom: false };

  await connectToDatabase();
  const custom = await LabExperiment.findOne({ slug, kind: "custom" }).lean();
  if (!custom) throwCode("NOT_FOUND", "Experiment not found.");
  return { ...custom, isCustom: true };
}

function validateFiles(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 40) {
    throwCode("VALIDATION_ERROR", "Add between 1 and 40 source files.");
  }

  const seenPaths = new Set();
  let totalBytes = 0;

  const files = input.map((file) => {
    if (!file || typeof file !== "object") {
      throwCode("VALIDATION_ERROR", "A source file is invalid.");
    }

    const path = typeof file.path === "string" ? file.path.trim() : "";
    const language =
      typeof file.language === "string" ? file.language.trim().toLowerCase() : "";
    if (typeof file.content !== "string") {
      throwCode("VALIDATION_ERROR", "Every source file must contain text content.");
    }
    const content = file.content;

    if (
      !SAFE_SOURCE_PATH.test(path) ||
      path.split("/").some((segment) => !segment || segment === "." || segment === "..") ||
      /[\u0000-\u001f\u007f]/.test(path) ||
      SECRET_FILE.test(path)
    ) {
      throwCode("VALIDATION_ERROR", "A file path is not allowed. Check path names and remove environment or credential files.");
    }

    const pathKey = path.toLowerCase();
    if (seenPaths.has(pathKey)) {
      throwCode("VALIDATION_ERROR", "Source file paths must be unique.");
    }
    seenPaths.add(pathKey);

    if (!LANGUAGES.has(language)) {
      throwCode("VALIDATION_ERROR", "Choose a supported text-file language.");
    }

    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content)) {
      throwCode("VALIDATION_ERROR", "Binary or unsupported file content is not allowed.");
    }

    const bytes = Buffer.byteLength(content, "utf8");
    if (bytes > 500000) {
      throwCode("VALIDATION_ERROR", "Each source file must be 500 KB or smaller.");
    }

    totalBytes += bytes;
    if (totalBytes > 1000000) {
      throwCode("VALIDATION_ERROR", "The complete source snapshot must be 1 MB or smaller.");
    }

    if (SECRET_CONTENT.some((pattern) => pattern.test(content))) {
      throwCode("VALIDATION_ERROR", "Potential credentials or private keys were detected. Remove them before saving.");
    }

    return { path, language, content };
  });

  return { files, totalBytes };
}

export async function validateOwnerLabPreviewFiles({ user, slug, inputFiles }) {
  assertOwner(user);
  const experiment = await getExperiment(slug);
  if (experiment.isCustom !== true) {
    throwCode("NOT_FOUND", "Only owner-created experiments can use the isolated React preview.");
  }

  const { files, totalBytes } = validateFiles(inputFiles);
  const allowedExtensions = new Set(["html", "js", "jsx", "mjs", "css", "json", "txt", "md"]);
  const unsupported = files.find((file) => {
    const extension = file.path.split(".").pop()?.toLowerCase() || "";
    return !allowedExtensions.has(extension);
  });
  if (unsupported) {
    throwCode(
      "VALIDATION_ERROR",
      "The React preview currently supports HTML, JavaScript, JSX, CSS, JSON, text and Markdown files. Unsupported file: " + unsupported.path,
    );
  }

  return { files, totalBytes };
}

function formatVersion(number) {
  return "v" + String(number);
}

let sourceIndexesPromise;

async function ensureIndexes() {
  if (!sourceIndexesPromise) {
    sourceIndexesPromise = Promise.all([
      LabExperiment.createIndexes(),
      LabSource.createIndexes(),
      LabSourceVersion.createIndexes(),
      LabSourceAuditEvent.createIndexes(),
    ]).catch((error) => {
      sourceIndexesPromise = null;
      throw error;
    });
  }

  await sourceIndexesPromise;
}

export async function listOwnerLabSources({ user }) {
  assertOwner(user);
  await connectToDatabase();
  await ensureIndexes();

  const [heads, versions, customExperiments] = await Promise.all([
    LabSource.find({})
      .select("slug version published draftVersionId publishedVersionId updatedAt")
      .lean(),
    LabSourceVersion.aggregate([
      { $sort: { versionNumber: -1 } },
      { $group: { _id: "$experimentSlug", latestVersion: { $first: "$version" }, versionCount: { $sum: 1 } } },
    ]),
    LabExperiment.find({ kind: "custom" })
      .select("slug title description category status createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const headBySlug = new Map(heads.map((head) => [head.slug, head]));
  const versionBySlug = new Map(versions.map((version) => [version._id, version]));

  const builtInItems = publishedLabExperiments.map((experiment) => {
    const head = headBySlug.get(experiment.slug) || null;
    const versionInfo = versionBySlug.get(experiment.slug);

    return {
      slug: experiment.slug,
      title: experiment.title,
      description: experiment.description,
      category: experiment.category,
      isCustom: false,
      hasSource: Boolean(head),
      published: head?.published === true,
      draftVersionId: head?.draftVersionId || null,
      publishedVersionId: head?.publishedVersionId || null,
      legacyVersion: head?.version || null,
      latestVersion: versionInfo?.latestVersion || null,
      versionCount: versionInfo?.versionCount || 0,
      updatedAt: head?.updatedAt ? new Date(head.updatedAt).toISOString() : null,
    };
  });

  const customItems = customExperiments.map((experiment) => {
    const head = headBySlug.get(experiment.slug) || null;
    const versionInfo = versionBySlug.get(experiment.slug);

    return {
      slug: experiment.slug,
      title: experiment.title,
      description: experiment.description,
      category: experiment.category,
      isCustom: true,
      lifecycleStatus: experiment.status,
      hasSource: Boolean(head),
      published: head?.published === true,
      draftVersionId: head?.draftVersionId || null,
      publishedVersionId: head?.publishedVersionId || null,
      legacyVersion: head?.version || null,
      latestVersion: versionInfo?.latestVersion || null,
      versionCount: versionInfo?.versionCount || 0,
      updatedAt: head?.updatedAt
        ? new Date(head.updatedAt).toISOString()
        : experiment.updatedAt?.toISOString?.() || null,
    };
  });

  return [...builtInItems, ...customItems];
}

export async function createOwnerLabSource({ user, slug }) {
  assertOwner(user);
  await getExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  const session = await mongoose.startSession();
  let source;

  try {
    await session.withTransaction(async () => {
      const [created] = await LabSource.create(
        [{
          slug,
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
          action: "source_created",
          experimentSlug: slug,
          versionId: null,
          requestId: null,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );

      source = created;
    });

    return { slug: source.slug, published: false, draftVersionId: null };
  } catch (error) {
    if (error?.code === 11000) {
      throwCode("CONFLICT", "A source record already exists for this experiment.");
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getOwnerLabSource({ user, slug }) {
  assertOwner(user);
  const experiment = await getExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  const source = await LabSource.findOne({ slug }).lean();
  if (!source) throwCode("NOT_FOUND", "Create a source record for this experiment first.");

  const [draft, published, publishedArtifact] = await Promise.all([
    source.draftVersionId
      ? LabSourceVersion.findOne({ versionId: source.draftVersionId, experimentSlug: slug }).lean()
      : null,
    source.publishedVersionId
      ? LabSourceVersion.findOne({ versionId: source.publishedVersionId, experimentSlug: slug }).lean()
      : null,
    source.publishedArtifactId
      ? LabBuildArtifact.findOne({ artifactId: source.publishedArtifactId, experimentSlug: slug, status: "ready" }).lean()
      : null,
  ]);

  const legacyFiles = Array.isArray(source.files) ? source.files : [];
  const editorFiles =
    draft?.files ||
    published?.files ||
    legacyFiles;

  return {
    slug,
    title: experiment.title,
    isCustom: experiment.isCustom === true,
    published: source.published === true,
    draftVersionId: source.draftVersionId || null,
    publishedVersionId: source.publishedVersionId || null,
    publishedArtifact: publishedArtifact ? {
      artifactId: publishedArtifact.artifactId,
      entryUrl: publishedArtifact.entryUrl,
      buildHash: publishedArtifact.buildHash,
      sourceVersionId: publishedArtifact.sourceVersionId,
    } : null,
    draft: draft
      ? {
          versionId: draft.versionId,
          version: draft.version,
          contentHash: draft.contentHash,
          createdAt: draft.createdAt?.toISOString?.() || null,
          files: draft.files,
        }
      : null,
    publishedVersion: published
      ? {
          versionId: published.versionId,
          version: published.version,
          createdAt: published.createdAt?.toISOString?.() || null,
        }
      : source.published
        ? { versionId: null, version: source.version, createdAt: source.updatedAt?.toISOString?.() || null }
        : null,
    files: editorFiles,
    legacy: !draft && !published && legacyFiles.length > 0,
  };
}

export async function saveOwnerLabDraft({
  user,
  slug,
  files: inputFiles,
  expectedDraftVersionId,
  basedOnVersionId = null,
  changeSummary = "",
  requestId = null,
  auditAction = "draft_saved",
}) {
  assertOwner(user);
  await getExperiment(slug);

  if (!["draft_saved", "version_restored"].includes(auditAction)) {
    throwCode("VALIDATION_ERROR", "The source audit action is invalid.");
  }

  if (
    expectedDraftVersionId !== null &&
    expectedDraftVersionId !== undefined &&
    (typeof expectedDraftVersionId !== "string" || expectedDraftVersionId.length > 64)
  ) {
    throwCode("VALIDATION_ERROR", "The draft version token is invalid.");
  }

  const { files, totalBytes } = validateFiles(inputFiles);
  const safeSummary = typeof changeSummary === "string" ? changeSummary.trim().slice(0, 500) : "";

  await connectToDatabase();
  await ensureIndexes();

  const session = await mongoose.startSession();
  let savedVersion;

  try {
    await session.withTransaction(async () => {
      const source = await LabSource.findOne({ slug }).session(session);
      if (!source) throwCode("NOT_FOUND", "Create a source record for this experiment first.");

      const currentDraftId = source.draftVersionId || null;
      const expectedId = expectedDraftVersionId || null;

      if (currentDraftId !== expectedId) {
        throwCode("CONFLICT", "A newer draft exists. Reload the editor before saving.");
      }

      const versionNumber = Math.max(1, Number(source.nextVersionNumber) || 1);
      const versionId = randomUUID();
      const contentHash = createHash("sha256")
        .update(JSON.stringify(files))
        .digest("hex");

      const versionDocument = {
        versionId,
        sourceId: source._id,
        experimentSlug: slug,
        versionNumber,
        version: formatVersion(versionNumber),
        files,
        contentHash,
        basedOnVersionId:
          basedOnVersionId || currentDraftId || source.publishedVersionId || null,
        changeSummary: safeSummary,
        createdBy: user.id,
      };

      const [created] = await LabSourceVersion.create([versionDocument], { session });
      source.draftVersionId = versionId;
      source.nextVersionNumber = versionNumber + 1;
      source.updatedBy = user.id;
      await source.save({ session });

      await LabSourceAuditEvent.create(
        [{
          actorUserId: user.id,
          action: auditAction,
          experimentSlug: slug,
          versionId,
          requestId,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );

      savedVersion = {
        versionId: created.versionId,
        version: created.version,
        contentHash: created.contentHash,
        fileCount: files.length,
        totalBytes,
      };
    });
  } finally {
    await session.endSession();
  }

  return savedVersion;
}

export async function listOwnerLabVersions({ user, slug }) {
  assertOwner(user);
  await getExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  const source = await LabSource.findOne({ slug }).select("_id").lean();
  if (!source) return [];

  const versions = await LabSourceVersion.find({ sourceId: source._id })
    .select("versionId version versionNumber contentHash basedOnVersionId changeSummary createdBy createdAt files")
    .sort({ versionNumber: -1 })
    .lean();

  return versions.map((version) => ({
    versionId: version.versionId,
    version: version.version,
    versionNumber: version.versionNumber,
    contentHash: version.contentHash,
    basedOnVersionId: version.basedOnVersionId || null,
    changeSummary: version.changeSummary || "",
    createdBy: version.createdBy,
    createdAt: version.createdAt?.toISOString?.() || null,
    fileCount: version.files?.length || 0,
  }));
}


export async function getOwnerLabVersion({ user, slug, versionId }) {
  assertOwner(user);
  await getExperiment(slug);

  if (typeof versionId !== "string" || versionId.length > 64) {
    throwCode("VALIDATION_ERROR", "The source version identifier is invalid.");
  }

  await connectToDatabase();
  await ensureIndexes();

  const source = await LabSource.findOne({ slug }).select("_id").lean();
  if (!source) throwCode("NOT_FOUND", "Source record not found.");

  const version = await LabSourceVersion.findOne({
    sourceId: source._id,
    experimentSlug: slug,
    versionId,
  })
    .select("versionId version versionNumber contentHash basedOnVersionId changeSummary createdBy createdAt files")
    .lean();

  if (!version) throwCode("NOT_FOUND", "The selected source version was not found.");

  return {
    versionId: version.versionId,
    version: version.version,
    versionNumber: version.versionNumber,
    contentHash: version.contentHash,
    basedOnVersionId: version.basedOnVersionId || null,
    changeSummary: version.changeSummary || "",
    createdBy: version.createdBy,
    createdAt: version.createdAt?.toISOString?.() || null,
    files: version.files,
  };
}

export async function restoreOwnerLabVersion({
  user,
  slug,
  versionId,
  expectedDraftVersionId,
  requestId = null,
}) {
  assertOwner(user);
  await getExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  const oldVersion = await LabSourceVersion.findOne({ versionId, experimentSlug: slug }).lean();
  if (!oldVersion) throwCode("NOT_FOUND", "The selected source version was not found.");

  const result = await saveOwnerLabDraft({
    user,
    slug,
    files: oldVersion.files,
    expectedDraftVersionId,
    basedOnVersionId: oldVersion.versionId,
    changeSummary: "Restore " + oldVersion.version,
    requestId,
    auditAction: "version_restored",
  });

  return result;
}

export async function publishOwnerLabSource({
  user,
  slug,
  versionId,
  artifactId = null,
  expectedPublishedVersionId,
  requestId = null,
}) {
  assertOwner(user);
  const experiment = await getExperiment(slug);
  if (typeof versionId !== "string" || versionId.length > 64) {
    throwCode("VALIDATION_ERROR", "Choose a saved source version to publish.");
  }

  await connectToDatabase();
  await ensureIndexes();

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const source = await LabSource.findOne({ slug }).session(session);
      if (!source) throwCode("NOT_FOUND", "Source record not found.");

      const currentPublishedId = source.publishedVersionId || null;
      if (currentPublishedId !== (expectedPublishedVersionId || null)) {
        throwCode("CONFLICT", "The published source changed. Reload before publishing.");
      }

      const version = await LabSourceVersion.findOne({
        versionId,
        sourceId: source._id,
        experimentSlug: slug,
      }).session(session);

      if (!version) throwCode("NOT_FOUND", "The selected draft version was not found.");

      let artifact = null;
      if (experiment.isCustom) {
        if (typeof artifactId !== "string" || artifactId.length > 64) {
          throwCode("PREVIEW_REQUIRED", "Build the exact saved draft before publishing it.");
        }
        artifact = await LabBuildArtifact.findOne({
          artifactId,
          experimentSlug: slug,
          sourceVersionId: version.versionId,
          sourceContentHash: version.contentHash,
          status: "ready",
        }).session(session);
        if (!artifact) {
          throwCode("PREVIEW_REQUIRED", "A successful build for this exact saved version is required before publishing.");
        }
        version.buildArtifactId = artifact.artifactId;
        version.buildHash = artifact.buildHash;
        await version.save({ session });
      }

      source.publishedVersionId = version.versionId;
      source.publishedArtifactId = artifact?.artifactId || null;
      source.published = true;
      source.version = version.version;
      source.updatedBy = user.id;
      await source.save({ session });

      await LabSourceAuditEvent.create(
        [{
          actorUserId: user.id,
          action: "source_published",
          experimentSlug: slug,
          versionId: version.versionId,
          requestId,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return { published: true, publishedVersionId: versionId };
}

export async function unpublishOwnerLabSource({
  user,
  slug,
  expectedPublishedVersionId,
  requestId = null,
}) {
  assertOwner(user);
  await getExperiment(slug);
  await connectToDatabase();

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const source = await LabSource.findOne({ slug }).session(session);
      if (!source) throwCode("NOT_FOUND", "Source record not found.");

      if ((source.publishedVersionId || null) !== (expectedPublishedVersionId || null)) {
        throwCode("CONFLICT", "The published source changed. Reload before unpublishing.");
      }

      source.published = false;
      source.publishedVersionId = null;
      source.publishedArtifactId = null;
      source.updatedBy = user.id;
      await source.save({ session });

      await LabSourceAuditEvent.create(
        [{
          actorUserId: user.id,
          action: "source_unpublished",
          experimentSlug: slug,
          versionId: expectedPublishedVersionId || null,
          requestId,
          resultCode: "ok",
          createdAt: new Date(),
        }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return { published: false, publishedVersionId: null };
}

export async function listOwnerLabAuditEvents({ user, slug, limit = 20 }) {
  assertOwner(user);
  await getExperiment(slug);

  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));

  await connectToDatabase();
  await ensureIndexes();

  const events = await LabSourceAuditEvent.find({ experimentSlug: slug })
    .select("action experimentSlug versionId requestId resultCode createdAt")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return events.map((event) => ({
    action: event.action,
    experimentSlug: event.experimentSlug,
    versionId: event.versionId || null,
    requestId: event.requestId || null,
    resultCode: event.resultCode,
    createdAt: event.createdAt?.toISOString?.() || null,
  }));
}

