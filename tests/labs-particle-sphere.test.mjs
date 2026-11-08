import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as THREE from "three";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstRadius,
  getParticleBurstParticleEnvelope,
  getParticleCameraChoreography,
  PARTICLE_BURST_EXPANSION,
  getOrbitBurstSpeed,
  ORBIT_BURST_SPEED_MULTIPLIER,
  isParticleBurstActive,
} from "../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs";
import {
  getParticleBurstSpreadScale,
  getParticleCameraDistance,
} from "../src/app/components/labs/landing/particle-sphere/particle-responsive.mjs";
import { getParticleSphereThemePalette } from "../src/app/components/labs/landing/particle-sphere/particle-theme.mjs";
import {
  areParticleQualityProfilesEqual,
  getParticleQualityProfile,
  hasParticleBudgetChanged,
} from "../src/app/components/labs/landing/particle-sphere/particle-quality.mjs";

const rendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const shaderSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-shaders.js", import.meta.url),
  "utf8",
);
const orbitSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-orbits.js", import.meta.url),
  "utf8",
);
const constantsSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-constants.js", import.meta.url),
  "utf8",
);
const interactionSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs", import.meta.url),
  "utf8",
);
const artworkSource = await readFile(
  new URL("../src/app/components/labs/landing/LabsHeroArtwork.js", import.meta.url),
  "utf8",
);

test("particle geometry creates the co...[truncated]