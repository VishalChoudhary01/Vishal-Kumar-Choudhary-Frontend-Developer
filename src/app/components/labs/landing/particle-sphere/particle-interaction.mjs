export const PARTICLE_BURST_OUTWARD_SECONDS = 0.45;
export const PARTICLE_BURST_RECOVERY_SECONDS = 1.3;
export const PARTICLE_BURST_STAGGER_SECONDS = 0.08;
export const PARTICLE_BURST_PARTICLE_RECOVERY_MIN = 1.05;
export const PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION = 0.16;
export const PARTICLE_BURST_TANGENTIAL_STRENGTH = 0.22;
export const PARTICLE_BURST_DRIFT_STRENGTH = 0.055;
export const PARTICLE_BURST_EXPANSION = 1.85;
export const PARTICLE_BURST_MAX_VARIATION = 1.18;
export const PARTICLE_BURST_CAMERA_PADDING = 0.2;

export function getParticleBurstRadius(sphereRadius) {
  if (!Number.isFinite(sphereRadius) || sphereRadius <= 0) {
    throw new RangeError("sphereRadius must be a positive finite number.");
  }

  return sphereRadius * (1 + PARTICLE_BURST_EXPANSION * PARTICLE_BURST_MAX_VARIATION)
    + PARTICLE_BURST_CAMERA_PADDING;
}
export const ORBIT_BURST_SPEED_MULTIPLIER = 1.65;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0, edge1, value) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

/**
 * 0 before the burst, eases outward for 450ms, then returns over 900ms.
 * The shader multiplies the temporary displacement by this value, leaving
 * the source geometry and the sphere's resting world-space radius unchanged.
 */
export function getParticleBurstEnvelope(elapsedSeconds) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return 0;

  if (elapsedSeconds <= PARTICLE_BURST_OUTWARD_SECONDS) {
    return smoothstep(0, PARTICLE_BURST_OUTWARD_SECONDS, elapsedSeconds);
  }

  const recoveryProgress = elapsedSeconds - PARTICLE_BURST_OUTWARD_SECONDS;

  if (recoveryProgress >= PARTICLE_BURST_RECOVERY_SECONDS) return 0;

  return 1 - smoothstep(
    0,
    PARTICLE_BURST_RECOVERY_SECONDS,
    recoveryProgress,
  );
}

export function getOrbitBurstSpeed(elapsedSeconds) {
  return 1 + getParticleBurstEnvelope(elapsedSeconds)
    * (ORBIT_BURST_SPEED_MULTIPLIER - 1);
}

export function isParticleBurstActive(elapsedSeconds) {
  return Number.isFinite(elapsedSeconds)
    && elapsedSeconds >= 0
    && elapsedSeconds < PARTICLE_BURST_OUTWARD_SECONDS + PARTICLE_BURST_RECOVERY_SECONDS;
}
