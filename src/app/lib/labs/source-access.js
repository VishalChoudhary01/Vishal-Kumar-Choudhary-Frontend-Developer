import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { getPublishedLabExperimentBySlug } from "@/app/data/labsExperiments";
import { getPublishedCustomLabExperimentBySlug } from "./public-experiments";

import LabSource from "./models/LabSource";
import LabSourceVersion from "./models/LabSourceVersion";

const SAFE_SOURCE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;
const SECRET_FILE =
  /(^|\/)\.env(?:\.|$)|(^|\/)(?:id_rsa|id_ed25519|credentials(?:\.json)?|secrets?\.(?:json|ya?ml))$/i;
const ALLOWED_LANGUAGES = new Set([
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
const SECRET_CONTENT = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-[A-Za-z0-9_-]{24,}\b/,
  /mongodb(?:\+srv)?:\/\/[^/\s:@]+:[^@\s]+@/i,
];

export async function getAuthorizedLabSource({ user, slug }) {
  if (!user?.id || user.emailVerified !== true) {
    return { status: "forbidden" };
  }

  // Source snapshots may only belong to canonical public Labs experiments.
  // This keeps stale/orphaned database rows from becoming addressable.
  if (!getPublishedLabExperimentBySlug(slug) && !(await getPublishedCustomLabExperimentBySlug(slug))) {
    return { status: "not-found" };
  }

  await connectToDatabase();

  // Every verified account can read every published snapshot. Source access
  // is no longer dependent on a per-user grant record.
  const source = await LabSource.findOne({ slug })
    .select("version files updatedAt published publishedVersionId")
    .lean();

  if (!source || source.published !== true) {
    return { status: "not-found" };
  }

  let snapshot = source;
  if (source.publishedVersionId) {
    snapshot = await LabSourceVersion.findOne({
      versionId: source.publishedVersionId,
      experimentSlug: slug,
    })
      .select("version files createdAt")
      .lean();

    if (!snapshot) return { status: "unavailable" };
  }

  if (!Array.isArray(snapshot.files)) {
    return { status: "unavailable" };
  }

  if (snapshot.files.length < 1 || snapshot.files.length > 40) {
    return { status: "unavailable" };
  }

  const files = [];
  let totalBytes = 0;

  for (const file of snapshot.files) {
    const safePath =
      file &&
      typeof file.path === "string" &&
      SAFE_SOURCE_PATH.test(file.path) &&
      !file.path.split("/").some((segment) => !segment || segment === "." || segment === "..") &&
      !SECRET_FILE.test(file.path);

    const safeLanguage =
      typeof file?.language === "string" &&
      ALLOWED_LANGUAGES.has(file.language);

    const safeContent =
      typeof file?.content === "string" &&
      !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(file.content) &&
      !SECRET_CONTENT.some((pattern) => pattern.test(file.content));

    if (!safePath || !safeLanguage || !safeContent) {
      return { status: "unavailable" };
    }

    totalBytes += Buffer.byteLength(file.content, "utf8");
    if (totalBytes > 1000000) {
      return { status: "unavailable" };
    }

    files.push({
      path: file.path,
      language: file.language,
      content: file.content,
    });
  }

  return {
    status: "ok",
    data: {
      slug,
      version: snapshot.version,
      updatedAt: snapshot.createdAt || source.updatedAt
        ? new Date(snapshot.createdAt || source.updatedAt).toISOString()
        : null,
      files,
    },
  };
}
