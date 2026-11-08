import { useEffect, useMemo, useRef, useState } from "react";

import { createSphereParticleData } from "./particle-geometry.mjs";
import { PARTICLE_SPHERE_CONFIG } from "./particle-constants";
import { ORBIT_SPECS } from "./particle-orbits";
import { getParticleCameraDistance } from "./particle-responsive.mjs";

const VIEW_SIZE = 600;
const DEFAULT_CAMERA_DISTANCE = 6.3;
const FOCAL_LENGTH = VIEW_SIZE / (2 * Math.tan(
  (PARTICLE_SPHERE_CONFIG.cameraFov * Math.PI) / 360,
));

const STATIC_PARTICLE_DATA = createSphereParticleData({
  surfaceCount: 1120,
  innerCount: 220,
  ambientCount: 20,
  radius: PARTICLE_SPHERE_CONFIG.radius,
  seed: 0x51f15e,
});

function rotateXYZ(point, rotation) {
  const [rotateX, rotateY, rotateZ] = rotation;
  const sinX = Math.sin(rotateX);
  const cosX = Math.cos(rotateX);
  const sinY = Math.sin(rotateY);
  const cosY = Math.cos(rotateY);
  const sinZ = Math.sin(rotateZ);
  const cosZ = Math.cos(rotateZ);

  const yAfterX = point.y * cosX - point.z * sinX;
  const zAfterX = point.y * sinX + point.z * cosX;
  const xAfterY = point.x * cosY + zAfterX * sinY;
  const zAfterY = -point.x * sinY + zAfterX * cosY;

  return {
    x: xAfterY * cosZ - yAfterX * sinZ,
    y: xAfterY * sinZ + yAfterX * cosZ,
    z: zAfterY,
  };
}

function projectPoint(point, cameraDistance) {
  const depth = Math.max(0.5, cameraDistance - point.z);
  const scale = FOCAL_LENGTH / depth;

  return {
    x: VIEW_SIZE / 2 + point.x * scale,
    y: VIEW_SIZE / 2 - point.y ¶»§q«^