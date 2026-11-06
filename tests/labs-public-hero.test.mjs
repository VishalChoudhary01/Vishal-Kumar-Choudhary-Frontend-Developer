import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getLabsHeroActions, LABS_COLLECTION_ANCHOR } from "../src/app/lib/labs/hero-cta.mjs";

const componentSource = await readFile(
  new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url),
  "utf8",
);
const pageSource = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const artworkSource = await readFile(
  new URL("../src/app/components/labs/landing/LabsHeroArtwork.js", import.meta.url),
  "utf8",
);

test("guest hero actions offer account creation and sign in with a Labs return destination", () => {
  assert.deepEqual(getLabsHeroActions({ authState: "guest" }), [
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
  ]);
});

test("signed-in unverified users are prompted to verify, not to sign in or register", () => {
  const actions = getLabsHeroActions({ authState: "unverified" });

  assert.deepEqual(actions.map(({ label }) => label), [
    "Verify email",
    "Explore experiments",
  ]);
  assert.equal(actions[0].href, "/labs/verify-email?returnTo=%2Flabs");
  assert.equal(actions[1].href, LABS_COLLECTION_ANCHOR);
});

test("verified users get discovery actions and only a safe internal featured link", () => {
  const actions = getLabsHeroActions({
    authState: "verified",
    featuredHref: "/labs/magnetic-interaction",
  });

  assert.deepEqual(actions.map(({ label }) => label), [
    "Explore experiments",
    "Explore featured experiment",
  ]);
  assert.equal(actions[1].href, "/labs/magnetic-interaction");

  const unsafeActions = getLabsHeroActions({
    authState: "verified",
    featuredHref: "https://example.com",
  });
  assert.equal(unsafeActions.length, 1);
});

test("unknown auth state is neutral and never exposes guest auth actions", () => {
  const actions = getLabsHeroActions({ authState: "unknown" });

  assert.deepEqual(actions, [
    {
      label: "Explore experiments",
      href: LABS_COLLECTION_ANCHOR,
      variant: "primary",
    },
  ]);
});

test("hero stats use an in-view one-time MotionValue animation and reduced-motion fallback", () => {
  assert.match(componentSource, /useInView\(statRef, \{ once: true/);
  assert.match(componentSource, /useMotionValue\(0\)/);
  assert.match(componentSource, /useTransform\(count/);
  assert.match(componentSource, /animate\(count, value/);
  assert.match(componentSource, /prefersReducedMotion \|\| value <= 0/);
});

test("Labs route resolves authentication on the server and treats unavailable auth as unknown", () => {
  assert.match(pageSource, /getCurrentAuthSession/);
  assert.match(pageSource, /isAuthRuntimeConfigured/);
  assert.match(pageSource, /authState = "unknown"/);
  assert.match(pageSource, /session\.user\.emailVerified === true \? "verified" : "unverified"/);
});

test("hero illustration is decorative and respects reduced motion", () => {
  assert.match(artworkSource, /aria-hidden="true"/);
  assert.match(artworkSource, /useReducedMotion/);
  assert.match(artworkSource, /reducedMotion \? false/);
  assert.match(artworkSource, /strokeDasharray/);
});
