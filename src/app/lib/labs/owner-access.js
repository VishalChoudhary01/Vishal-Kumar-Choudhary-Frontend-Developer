import "server-only";

export function isLabsOwner(user) {
  const configuredOwnerId = process.env.LABS_OWNER_USER_ID;

  return Boolean(
    configuredOwnerId &&
    user?.id &&
    user.id === configuredOwnerId &&
    user.emailVerified === true
  );
}
