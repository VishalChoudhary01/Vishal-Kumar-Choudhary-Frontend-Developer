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
const staticArtworkSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/StaticParticleSphereArtwork.js", import.meta.url),
  "utf8",
);
const particleRendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const orbitSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-orbits.js", import.meta.url),
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

test("signed-in unverified user¶»§q«^