export const SPHERE_PULSE_PERIOD = 7.4;
export const SPHERE_CONTRACTION_MIN_SCALE = 0.7;

const PULSE_PHASE_OFFSET = 5.5;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0, edge1, value) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

/**
 * Returns a normalized radial contraction envelope:
 * 0 = full-size sphere, 1 = smallest contracted sphere.
 */
export function getSphereContraction(timeSeconds) {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return 0;

  const phase = (timeSeconds + PULSE_PHASE_OFFSET) % SPHERE_PULSE_PERIOD;
  const contract = smoothstep(0.12, 0.58, phase);
  const recover = 1 - smoothstep(1.1, 1.68, phase);

  return clamp01(contract * recover);
}

export function getSphereScale(timeSeconds) {
  const contraction = getSphereContraction(timeSeconds);

  return 1 - (1 - SPHERE_CONTRACTION_MIN_SCALE) * contraction;
}

/** @deprecated Use getSphereContraction; this legacy alias is also radial. */
export const getSphereSqueeze = getSphereContraction;
