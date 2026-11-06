export const LABS_COLLECTION_ANCHOR = "#labs-collection-heading";

const LABS_GUEST_ACTIONS = [
  {
    label: "Create account",
    href: "/labs/signup?returnTo=%2Flabs",
    variant: "primary",
  },
  {
    label: "Sign in",
    href: "/labs/login?returnTo=%2Flabs",
    variant: "secondary",
  },
];

const LABS_UNVERIFIED_ACTIONS = [
  {
    label: "Verify email",
    href: "/labs/verify-email?returnTo=%2Flabs",
    variant: "primary",
  },
  {
    label: "Explore experiments",
    href: LABS_COLLECTION_ANCHOR,
    variant: "secondary",
  },
];

const LABS_VERIFIED_ACTIONS = [
  {
    label: "Explore experiments",
    href: LABS_COLLECTION_ANCHOR,
    variant: "primary",
  },
];

function isSafeFeaturedHref(value) {
  return (
    typeof value === "string" &&
    /^\/labs\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

/**
 * Keep the public hero's auth CTA matrix explicit and testable.
 * Unknown auth state is deliberately neutral; it must never be treated as guest.
 */
export function getLabsHeroActions({ authState = "unknown", featuredHref = null } = {}) {
  if (authState === "guest") {
    return LABS_GUEST_ACTIONS.map((action) => ({ ...action }));
  }

  if (authState === "unverified") {
    return LABS_UNVERIFIED_ACTIONS.map((action) => ({ ...action }));
  }

  if (authState === "verified") {
    const actions = LABS_VERIFIED_ACTIONS.map((action) => ({ ...action }));

    if (isSafeFeaturedHref(featuredHref)) {
      actions.push({
        label: "Explore featured experiment",
        href: featuredHref,
        variant: "secondary",
      });
    }

    return actions;
  }

  return [
    {
      label: "Explore experiments",
      href: LABS_COLLECTION_ANCHOR,
      variant: "primary",
    },
  ];
}
