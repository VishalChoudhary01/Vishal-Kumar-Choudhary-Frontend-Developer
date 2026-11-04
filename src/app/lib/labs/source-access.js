import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";

import LabSource from "./models/LabSource";
import LabSourceVersion from "./models/LabSourceVersion";

const SAFE_SOURCE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;

export async function getAuthorizedLabSource({ user, slug }) {
  if (!user?.id || user.emailVerified !== true) {
    return { status: "forbidden" };
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

  const files = snapshot.files
    .filter(
      (file) =>
        file &&
        typeof file.path === "string" &&
        SAFE_SOURCE_PATH.test(file.path) &&
        typeof file.language === "string" &&
        typeof file.content === "string",
    )
    .map((file) => ({
      path: file.path,
      language: file.language,
      content: file.content,
    }));

  const totalBytes = files.reduce(
    (total, file) => total + Buffer.byteLength(file.content, "utf8"),
    0,
  );

  if (!files.length || totalBytes > 1000000) {
    return { status: "unavailable" };
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
