export const MAGNETIC_SPRING = Object.freeze({
  stiffness: 280,
  damping: 24,
  mass: 0.55,
});

export const DEFAULT_MAGNETIC_STRENGTH = 28;
export const DEFAULT_MAGNETIC_RADIUS = 180;
export const MAX_MAGNETIC_STRENGTH = 42;
export const MIN_MAGNETIC_RADIUS = 80;
export const MAX_MAGNETIC_RADIUS = 300;
export const MAGNETIC_POINTER_MULTIPLIER = 0.24;
export const MAGNETIC_PROXIMITY_EXPONENT = 1.25;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeMagneticStrength(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_MAGNETIC_STRENGTH;
  }

  const numeric = Number(value);
  return clamp(
    Number.isFinite(numeric) ? numeric : DEFAULT_MAGNETIC_STRENGTH,
    0,
    MAX_MAGNETIC_STRENGTH,
  );
}

export function normalizeMagneticRadius(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_MAGNETIC_RADIUS;
  }

  const numeric = Number(value);
  return clamp(
    Number.isFinite(numeric) && numeric !== 0 ? numeric : DEFAULT_MAGNETIC_RADIUS,
    MIN_MAGNETIC_RADIUS,
    MAX_MAGNETIC_RADIUS,
  );
}

/**
 * Pure pointer-to-displacement calculation shared by the component and tests.
 * Pointer type, reduced-motion and disabled checks remain in the component.
 */
export function calculateMagneticOffset({
  offsetX,
  offsetY,
  strength = DEFAULT_MAGNETIC_STRENGTH,
  radius = DEFAULT_MAGNETIC_RADIUS,
}) {
  const safeStrength = normalizeMagneticStrength(strength);
  const safeRadius = normalizeMagneticRadius(radius);
  const x = Number(offsetX) || 0;
  const y = Number(offsetY) || 0;
  const distance = Math.hypot(x, y);

  if (distance >= safeRadius || safeStrength <= 0) {
    return { x: 0, y: 0, engaged: false };
  }

  const proximity = 1 - distance / safeRadius;
  const influence = Math.pow(proximity, MAGNETIC_PROXIMITY_EXPONENT);

  return {
    x: clamp(
      x * MAGNETIC_POINTER_MULTIPLIER * influence,
      -safeStrength,
      safeStrength,
    ),
    y: clamp(
      y * MAGNETIC_POINTER_MULTIPLIER * influence,
      -safeStrength,
      safeStrength,
    ),
    engaged: true,
  };
}
