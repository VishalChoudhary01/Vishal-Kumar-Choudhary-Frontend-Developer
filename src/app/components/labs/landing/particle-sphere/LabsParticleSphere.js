"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { createSphereParticleData } from "./particle-geometry.mjs";
import {
  particleFragmentShader,
  particleVertexShader,
} from "./particle-shaders";
import { createParticleOrbits } from "./particle-orbits";
import {
  getParticleBurstSpreadScale,
  getParticleCameraDistance,
} from "./particle-responsive.mjs";
import { getParticleSphereThemePalette } from "./particle-theme.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstRadius,
  getParticleCameraChoreography,
  PARTICLE_CAMERA_ANTICIPATION_DISTANCE_RATIO,
  PARTICLE_BURST_EXPANSION,
  PARTICLE_BURST_STAGGER_SECONDS,
  PARTICLE_BURST_OUTWARD_SECONDS,
  PARTICLE_BURST_RECOVERY_SECONDS,
  PARTICLE_BURST_PARTICLE_RECOVERY_MIN,
  PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION,
  PARTICLE_BURST_TANGENTIAL_STRENGTH,
  PARTICLE_BURST_TANGENTIAL_VARIATION,
  PARTICLE_BURST_DRIFT_STRENGTH,
} from "./particle-interaction.mjs";
import { PARTICLE_SPHERE_CONFIG } from "./particle-constants";
import {
  areParticleQualityProfilesEqual,
  getParticleQualityProfile,
  hasParticleBudgetChanged,
} from "./particle-quality.mjs";

function createParticleGeometry(profile) {
  const data = createSphereParticleData({
    surfaceCount: profile.surfaceCount,
    innerCount: profile.innerCount,
    ambientCount: profile.ambientCount,
    radius: PARTICLE_SPHERE_CONFIG.radius,
  });
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(data.positions, 3),
  );
  geometry.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
  geometry.setAttribute("aLayer", new THREE.BufferAttribute(data.layers, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export default function LabsParticleSphere()...[truncated]