import "server-only";

export function getLabsOwnerAccessStatus(user) {
  if (!user?.id) return "unauthenticated";
  if (user.emailVerified !== true) return "email-unverified";

  const configuredOwnerId = process.env.LABS_OWNER_USER_ID?.trim();
  if (!configuredOwnerId) return "not-configured";

  return user.id === configuredOwnerId ? "owner" : "account-mismatch";
}

export function isLabsOwner(user) {
  return getLabsOwnerAccessStatus(user) === "owner";
}
