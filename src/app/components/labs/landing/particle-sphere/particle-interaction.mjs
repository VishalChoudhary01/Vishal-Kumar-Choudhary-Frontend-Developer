export const PARTICLE_BURST_OUTWARD_SECONDS = 0.45;
export const PARTICLE_BURST_RECOVERY_SECONDS = 1.3;
export const PARTICLE_BURST_EXPANSION = 1.85;
export const PARTICLE_BURST_MAX_VARIATION = 1.18;
export const PARTICLE_BURST_CAMERA_PADDING = 0.2;
export const PARTICLE_BURST_STAGGER_SECONDS = 0.08;
export const PARTICLE_BURST_PARTICLE_RECOVERY_MIN = 1.05;
export const PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION = 0.16;
export const PARTICLE_BURST_TANGENTIAL_STRENGTH = 0.22;
export const PARTICLE_BURST_TANGENTIAL_VARIATION = 1.35;
export const PARTICLE_BURST_DRIFT_STRENGTH = 0.055;
export const PARTICLE_CAMERA_ANTICIPATION_SECONDS = 0.12;
export const PARTICLE_CAMERA_ANTICIPATION_RELEASE_SECONDS = 0.28;
export const PARTICLE_CAMERA_PULLBACK_DELAY_SECONDS = 0.14;
export const PARTICLE_CAMERA_ANTICIPATION_DISTANCE_RATIO = 0.024;
export const ORBIT_BURST_SPEED_MULTIPLIER = 1.65;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0, edge1, value) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

function fract(value) {
  return value - Math.floor(value);
}

export function getParticleBurstRadius(sphereRadius) {
  if (!Number.isFinite(sphereRadius) || sphereRadius <= 0) {
    throw new RangeError("sphereRadius must be a positive finite number.");
  }

  const radialReach = PARTICLE_BURST_EXPANSION * PARTICLE_BURST_MAX_VARIATION;
  const tangentialReach = PARTICLE_BURST_TANGENTIAL_STRENGTH
    * (0.65 + PARTICLE_BURST_TANGENTIAL_VARIATION);
  const driftReach = PARTICLE_BURST_DRIFT_STRENGTH;

  return sphereRadius * (
    1 + radialReach * Math.sqrt(
      1 + tangentialReach ** 2 + driftReach ** 2,
    )
  ) + PARTICLE_BURST_CAMERA_PADDING;
}

/**
 * Per-particle envelope with a seed-based start delay and recovery duration.
 * The seed is normalized to [0, 1), matching the stable geometry attribute.
 */
export function getParticleBurstParticleEnvelope(elapsedSeconds, seed = 0) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 || !Number.isFinite(seed)) {
    return 0;
  }

  const normalizedSeed = fract(Math.abs(seed));
  const stagger = normalizedSeed * PARTICLE_BURST_STAGGER_SECONDS;
  const localTime = elapsedSeconds - stagger;

  if (localTime <= 0) return 0;

  const recoveryVariation = fract(normalizedSeed * 7.13);
  const recoveryDuration = PARTICLE_BURST_RECOVERY_SECONDS * (
    PARTICLE_BURST_PARTICLE_RECOVERY_MIN
      + recoveryVariation * PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION
  );
  const attack = smoothstep(0, PARTICLE_BURST_OUTWARD_SECONDS, localTime);
  const recovery = 1 - smoothstep(
    PARTICLE_BURST_OUTWARD_SECONDS,
    PARTICLE_BURST_OUTWARD_SECONDS + recoveryDuration,
    localTime,
  );

  return clamp01(attack * recovery);
}

/**
 * Global camera/orbit envelope. It holds the wide framing until the last
 * staggered particles have launched, then returns after the longest recovery.
 */
export function getParticleBurstEnvelope(elapsedSeconds) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return 0;

  const recoveryStart = PARTICLE_BURST_OUTWARD_SECONDS
    + PARTICLE_BURST_STAGGER_SECONDS;
  const maxRecovery = PARTICLE_BURST_RECOVERY_SECONDS * (
    PARTICLE_BURST_PARTICLE_RECOVERY_MIN
      + PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION
  );

  if (elapsedSeconds <= PARTICLE_BURST_OUTWARD_SECONDS) {
    return smoothstep(0, PARTICLE_BURST_OUTWARD_SECONDS, elapsedSeconds);
  }

  if (elapsedSeconds <= recoveryStart) return 1;

  const recoveryProgress = elapsedSeconds - recoveryStart;
  if (recoveryProgress >= maxRecovery) return 0;

  return 1 - smoothstep(0, maxRecovery, recoveryProgress);
}

/**
 * Camera choreography intentionally trails the particle impulse. A small
 * anticipation move draws the camera inward first; the wide pullback starts
 * after the particles have begun moving and follows their longer recovery.
 */
export function getParticleCameraChoreography(elapsedSeconds) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    return { anticipation: 0, pullback: 0 };
  }

  const anticipationIn = smoothstep(
    0,
    PARTICLE_CAMERA_ANTICIPATION_SECONDS,
    elapsedSeconds,
  );
  const anticipationOut = 1 - smoothstep(
    PARTICLE_CAMERA_ANTICIPATION_SECONDS,
    PARTICLE_CAMERA_ANTICIPATION_RELEASE_SECONDS,
    elapsedSeconds,
  );
  const anticipation = anticipationIn * anticipationOut;
  const pullback = getParticleBurstEnvelope(
    elapsedSeconds - PARTICLE_CAMERA_PULLBACK_DELAY_SECONDS,
  );

  return { anticipation, pullback };
}

export function getOrbitBurstSpeed(elapsedSeconds) {
  return 1 + getParticleBurstEnvelope(elapsedSeconds)
    * (ORBIT_BURST_SPEED_MULTIPLIER - 1);
}

export function isParticleBurstActive(elapsedSeconds) {
  const totalDuration = PARTICLE_BURST_OUTWARD_SECONDS
    + PARTICLE_BURST_STAGGER_SECONDS
    + PARTICLE_BURST_RECOVERY_SECONDS * (
      PARTICLE_BURST_PARTICLE_RECOVERY_MIN
        + PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION
    );

  return Number.isFinite(elapsedSeconds)
    && elapsedSeconds >= 0
    && elapsedSeconds < totalDuration;
}
