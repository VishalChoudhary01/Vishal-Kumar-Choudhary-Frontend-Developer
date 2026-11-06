const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_HASH = /^[a-f0-9]{64}$/;

function isSafeArtifactFilePath(value) {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.includes("\\")) {
    return false;
  }

  const segments = value.split("/");
  return segments.length <= 12 && segments.every((segment) =>
    segment &&
    segment !== "." &&
    segment !== ".." &&
    /^[A-Za-z0-9_][A-Za-z0-9._-]{0,179}$/.test(segment)
  );
}

/**
 * Every publish attempt gets a new artifact ID. Including it in every Blob
 * object key makes retries idempotent at the source/version level without
 * trying to overwrite public immutable files from a previous attempt.
 */
export function getPublishedArtifactBlobPath({
  experimentSlug,
  sourceVersionId,
  buildHash,
  artifactId,
  filePath,
}) {
  if (
    typeof experimentSlug !== "string" ||
    !SAFE_SLUG.test(experimentSlug) ||
    typeof sourceVersionId !== "string" ||
    !SAFE_ID.test(sourceVersionId) ||
    typeof artifactId !== "string" ||
    !SAFE_ID.test(artifactId) ||
    typeof buildHash !== "string" ||
    !SAFE_HASH.test(buildHash) ||
    !isSafeArtifactFilePath(filePath)
  ) {
    throw new Error("The immutable artifact storage path is invalid.");
  }

  return [
    "labs",
    experimentSlug,
    sourceVersionId,
    buildHash,
    artifactId,
    ...filePath.split("/"),
  ].join("/");
}
