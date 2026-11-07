export const SPHERE_PULSE_PERIOD = 7.4;

const PULSE_PHASE_OFFSET = 5.5;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0, edge1, value) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

/**
 * Returns a smooth squeeze envelope from 0 (round) to 1 (fully compressed).
 * The delayed first pulse lets the sphere establish its resting silhouette.
 */
export function getSphereSqueeze(timeSeconds) {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return 0;

  const phase = (timeSeconds + PULSE_PHASE_OFFSET) % SPHERE_PULSE_PERIOD;
  const attack = smoothstep(0.12, 0.58, phase);
  const release = 1 - smoothstep(1.1, 1.68, phase);

  return clamp01(attack * release);
}
