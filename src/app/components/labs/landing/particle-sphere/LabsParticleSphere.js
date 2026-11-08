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
  getParticleCameraProjectionShift,
} from "./particle-responsive.mjs";
import { getParticleSphereThemePalette } from "./particle-theme.mjs";
import {
  getParticleBurstEnvelope,
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
    new THREE.BufferAttribute(data.p¶»§q«^u‰Í•ÉÙ•È€ô¹•Ü%¹Ñ•ÉÍ•Ñ¥½¹=‰Í•ÉÙ•È (€€€€€€€€€€¡m•¹ÑÉåt¤€ôøì(€€€€€€€€€€€¥Í%¹Y¥•Ü€ô	½½±•…¸¡•¹ÑÉäü¹¥Í%¹Ñ•ÉÍ•Ñ¥¹œ¤ì((€€€€€€€€€€€¥˜€¡¥Í%¹Y¥•Ü¤ì(€€€€€€€€€€€€€ÍÑ…ÉĞ ¤ì(€€€€€€€€€€€ô•±Í”ì(€€€€€€€€€€€€€ÍÑ½À ¤ì(€€€€€€€€€€€ô(€€€€€€€€€ô°(€€€€€€€€€ìÑ¡É•Í¡½±è€À¸ÀÈô°(€€€€€€€€¤ì(€€€€€€€¥¹Ñ•ÉÍ•Ñ¥½¹=‰Í•ÉÙ•È¹½‰Í•ÉÙ”¡µ½Õ¹Ğ¤ì(€€€€€ô((€€€€€¡…¹‘±•½¹Ñ•áÑ1½ÍĞ€ô€¡•Ù•¹Ğ¤€ôøì(€€€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€€€‘¥ÍÁ½Í•M•¹” ¤ì(€€€€€€€Í•Ñ]•‰±…¥±•¡ÑÉÕ”¤ì(€€€€€€€½¹I•¹‘•É•ÉMÑ…Ñ•¡…¹•I•˜¹ÕÉÉ•¹Ğü¸¡™…±Í”¤ì(€€€€€ôì(€€€€€É•¹‘•É•È¹‘½µ±•µ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰İ•‰±½¹Ñ•áÑ±½ÍĞˆ°¡…¹‘±•½¹Ñ•áÑ1½ÍĞ°™…±Í”¤ì((€€€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Ù¥Í¥‰¥±¥Ñå¡…¹”ˆ°¡…¹‘±•Y¥Í¥‰¥±¥Ñå¡…¹”¤ì(€€€€€ÍÑ…ÉĞ ¤ì((€€€€€É•ÑÕÉ¸‘¥ÍÁ½Í•M•¹”ì(€€€ô…Ñ ì(€€€€€‘¥ÍÁ½Í•M•¹” ¤ì(€€€€€Í•Ñ]•‰±…¥±•¡ÑÉÕ”¤ì(€€€€€½¹I•¹‘•É•ÉMÑ…Ñ•¡…¹•I•˜¹ÕÉÉ•¹Ğü¸¡™…±Í”¤ì(€€€€€É•ÑÕÉ¸Õ¹‘•™¥¹•ì(€€€ô(€ô°mt¤ì((€¥˜€¡İ•‰±…¥±•¤É•ÑÕÉ¸¹Õ±°ì((€É•ÑÕÉ¸€ (€€€€ñ‘¥Ø(€€€€€É•˜õíµ½Õ¹ÑI•™ô(€€€€€…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ(€€€€€±…ÍÍ9…µ”ô‰…‰Í½±ÕÑ”¥¹Í•Ğ´À µ™Õ±°Üµ™Õ±°½Ù•É™±½Üµ¡¥‘‘•¸ˆ(€€€€¼ø(€€¤ì)ô