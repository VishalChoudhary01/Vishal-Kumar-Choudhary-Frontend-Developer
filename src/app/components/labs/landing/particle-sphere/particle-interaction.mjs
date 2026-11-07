export const PARTICLE_BURST_OUTWARD_SECONDS = 0.45;
export const PARTICLE_BURST_RECOVERY_SECONDS = 0.9;
export const PARTICLE_BURST_EXPANSION = 1.85;
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
