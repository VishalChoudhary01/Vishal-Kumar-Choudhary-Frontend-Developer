import { createHash } from "node:crypto";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Deterministic one-per-user/experiment/published-version event identity.
 * It is only generated from server-resolved values, never request payload.
 */
export function createComponentCopyEventId({ userId, experimentSlug, sourceVersionId }) {
  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    userId.length > 128 ||
    typeof experimentSlug !== "string" ||
    !SLUG_PATTERN.test(experimentSlug) ||
    typeof sourceVersionId !== "string" ||
    !sourceVersionId.trim() ||
    sourceVersionId.length > 64
  ) {
    throw new TypeError("A valid actor, experiment, and published source version are required.");
  }

  // Preserve the previous production key format so accounts whose component
  // was already counted by the earlier all-files completion rule are not
  // counted a second time after this behavior correction.
  const identity = userId.trim() + "\n" + experimentSlug + "\n" + sourceVersionId.trim();
  return "component_" + createHash("sha256").update(identity).digest("hex");
}
