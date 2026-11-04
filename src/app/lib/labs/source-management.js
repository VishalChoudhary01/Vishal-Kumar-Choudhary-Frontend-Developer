import "server-only";

import { createHash, randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { publishedLabExperiments } from "@/app/data/labsExperiments";
import LabSource from "./models/LabSource";
import LabSourceVersion from "./models/LabSourceVersion";
import LabSourceAuditEvent from "./models/LabSourceAuditEvent";
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

function assertExperiment(slug) {
  const experiment = publishedLabExperiments.find((item) => item.slug === slug);
  if (!experiment) throwCode("NOT_FOUND", "Experiment not found.");
  return experiment;
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
    const content = typeof file.content === "string" ? file.content : "";

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

function formatVersion(number) {
  return "v" + String(number);
}

async function ensureIndexes() {
  await Promise.all([
    LabSource.createIndexes(),
    LabSourceVersion.createIndexes(),
    LabSourceAuditEvent.createIndexes(),
  ]);
}

async function writeAudit({ userId, action, slug, versionId = null, requestId = null }) {
  await LabSourceAuditEvent.create({
    actorUserId: userId,
    action,
    experimentSlug: slug,
    versionId,
    requestId,
    resultCode: "ok",
    createdAt: new Date(),
  });
}

export async function listOwnerLabSources({ user }) {
  assertOwner(user);
  await connectToDatabase();
  await ensureIndexes();

  const [heads, versions] = await Promise.all([
    LabSource.find({})
      .select("slug version published draftVersionId publishedVersionId updatedAt")
      .lean(),
    LabSourceVersion.aggregate([
      { $sort: { versionNumber: -1 } },
      { $group: { _id: "$experimentSlug", latestVersion: { $first: "$version" }, versionCount: { $sum: 1 } } },
    ]),
  ]);

  const headBySlug = new Map(heads.map((head) => [head.slug, head]));
  const versionBySlug = new Map(versions.map((version) => [version._id, version]));

  return publishedLabExperiments.map((experiment) => {
    const head = headBySlug.get(experiment.slug) || null;
    const versionInfo = versionBySlug.get(experiment.slug);

    return {
      slug: experiment.slug,
      title: experiment.title,
      description: experiment.description,
      hasSource: Boolean(head),
      published: Boolean(head?.published && (head.publishedVersionId || head.files?.length)),
      draftVersionId: head?.draftVersionId || null,
      publishedVersionId: head?.publishedVersionId || null,
      legacyVersion: head?.version || null,
      latestVersion: versionInfo?.latestVersion || null,
      versionCount: versionInfo?.versionCount || 0,
      updatedAt: head?.updatedAt ? new Date(head.updatedAt).toISOString() : null,
    };
  });
}

export async function createOwnerLabSource({ user, slug }) {
  assertOwner(user);
  assertExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  try {
    const source = await LabSource.create({
      slug,
      version: "0.0",
      published: false,
      files: [],
      draftVersionId: null,
      publishedVersionId: null,
      nextVersionNumber: 1,
      createdBy: user.id,
      updatedBy: user.id,
    });

    await writeAudit({ userId: user.id, action: "source_created", slug });
    return { slug: source.slug, published: false, draftVersionId: null };
  } catch (error) {
    if (error?.code === 11000) {
      throwCode("CONFLICT", "A source record already exists for this experiment.");
    }
    throw error;
  }
}

export async function getOwnerLabSource({ user, slug }) {
  assertOwner(user);
  assertExperiment(slug);
  await connectToDatabase();
  await ensureIndexes();

  const source = await LabSource.findOne({ slug }).lean();
  if (!source) throwCode("NOT_FOUND", "Create a source record for this experiment first.");

  const [draft, published] = await Promise.all([
    source.draftVersionId
      ? LabSourceVersion.findOne({ versionId: source.draftVersionId, experimentSlug: slug }).lean()
      : null,
    source.publishedVersionId
      ? LabSourceVersion.findOne({ versionId: source.publishedVersionId, experimentSlug: slug }).lean()
      : null,
  ]);

  const legacyFiles = Array.isArray(source.files) ? source.files : [];
  const editorFiles =
    draft?.files ||
    published?.files ||
    legacyFiles;

  return {
    slug,
    title: assertExperiment(slug).title,
    published: source.published === true,
    draftVersionId: source.draftVersionId || null,
    publishedVersionId: source.publishedVersionId || null,
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
  changeSummary = "",
  requestId = null,
}) {
  assertOwner(user);
  assertExperiment(slug);

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
        basedOnVersionId: currentDraftId || source.publishedVersionId || null,
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
          action: "draft_saved",
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
  assertExperiment(slug);
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

export async function restoreOwnerLabVersion({
  user,
  slug,
  versionId,
  expectedDraftVersionId,
  requestId = null,
}) {
  assertOwner(user);
  assertExperiment(slug);
  await connectToDatabase();

  const oldVersion = await LabSourceVersion.findOne({ versionId, experimentSlug: slug }).lean();
  if (!oldVersion) throwCode("NOT_FOUND", "The selected source version was not found.");

  const result = await saveOwnerLabDraft({
    user,
    slug,
    files: oldVersion.files,
    expectedDraftVersionId,
    changeSummary: "Restore " + oldVersion.version,
    requestId,
  });

  await writeAudit({
    userId: user.id,
    action: "version_restored",
    slug,
    versionId: result.versionId,
    requestId,
  });

  return result;
}

export async function publishOwnerLabSource({
  user,
  slug,
  versionId,
  expectedPublishedVersionId,
  requestId = null,
}) {
  assertOwner(user);
  assertExperiment(slug);
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

      source.publishedVersionId = version.versionId;
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
  assertExperiment(slug);
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
