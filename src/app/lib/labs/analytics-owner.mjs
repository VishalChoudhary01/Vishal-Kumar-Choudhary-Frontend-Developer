export const LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL = "vishal.bhumca21@gmail.com";

export function isExcludedLabsAnalyticsOwner(user) {
  return Boolean(
    user &&
    user.emailVerified === true &&
    typeof user.id === "string" &&
    user.id.trim() &&
    typeof user.email === "string" &&
    user.email.trim().toLowerCase() === LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL
  );
}
