export const PARTICLE_BURST_OUTWARD_SECONDS = 0.45;
export const PARTICLE_BURST_RECOVERY_SECONDS = 1.3;
export const PARTICLE_BURST_EXPANSION = 1.85;
export const PARTICLE_BURST_STAGGER_SECONDS = 0.08;
export const PARTICLE_BURST_PARTICLE_RECOVERY_MIN = 1.05;
export const PARTICLE_BURST_PARTICLE_RECOVERY_VARIATION = 0.16;
export const PARTICLE_BURST_TANGENTIAL_STRENGTH = 0.22;
export const PARTICLE_BURST_TANGENTIAL_VARIATION = 1.35;
export const PARTICLE_BURST_DRIFT_STRENGTH = 0.055;

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
