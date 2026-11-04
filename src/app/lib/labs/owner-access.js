import "server-only";

export function getLabsOwnerAccessStatus(user) {
  if (!user?.id) return "unauthenticated";
  if (user.emailVerified !== true) return "email-unverified";

  const configuredOwnerId = process.env.LABS_OWNER_USER_ID?.trim();
  const configuredOwnerEmail = process.env.LABS_OWNER_EMAIL?.trim().toLowerCase();
  const accountEmail =
    typeof user.email === "string" ? user.email.trim().toLowerCase() : "";

  if (!configuredOwnerId && !configuredOwnerEmail) return "not-configured";

  // Stable Better Auth user ID is preferred. A separately configured email
  // is also allowed as an explicit bootstrap identity for the verified owner.
  if (
    (configuredOwnerId && user.id === configuredOwnerId) ||
    (configuredOwnerEmail && accountEmail === configuredOwnerEmail)
  ) {
    return "owner";
  }

  return "account-mismatch";
}

export function isLabsOwner(user) {
  return getLabsOwnerAccessStatus(user) === "owner";
}
