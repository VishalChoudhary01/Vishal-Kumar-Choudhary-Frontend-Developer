import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstParticleEnvelope,
  PARTICLE_BURST_EXPANSION,
  isParticleBurstActive,
} from "../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs";
import {
  getParticleBurstSpreadScale,
  getParticleCameraDistance,
  getParticleCameraProjectionShift,
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
  new URL("../src/app/components/labs/landing/particle-sphere/p¶»§q«^