import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";

import LabSource from "./models/LabSource";
import LabSourceGrant from "./models/LabSourceGrant";

const SAFE_SOURCE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;

export async function getAuthorizedLabSource({ user, slug }) {
  if (!user?.id || user.emailVerified !== true) {
    return { status: "forbidden" };
  }

  await connectToDatabase();

  const now = new Date();
  const grant = await LabSourceGrant.findOne({
    userId: user.id,
    experimentSlug: slug,
    active: true,
    revokedAt: null,
    $or: [
      { expiresAt: null },
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  })
    .select("_id")
    .lean();

  if (!grant) {
    return { status: "forbidden" };
  }

  const source = await LabSource.findOne({
    slug,
    published: true,
  })
    .select("version files updatedAt")
    .lean();

  if (!source || !Array.isArray(source.files)) {
    return { status: "not-found" };
  }

  const files = source.files
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

  const totalCharacters = files.reduce(
    (total, file) => total + file.content.length,
    0,
  );

  if (!files.length || totalCharacters > 1000000) {
    return { status: "unavailable" };
  }

  return {
    status: "ok",
    data: {
      slug,
      version: source.version,
      updatedAt: source.updatedAt
        ? new Date(source.updatedAt).toISOString()
        : null,
      files,
    },
  };
}
