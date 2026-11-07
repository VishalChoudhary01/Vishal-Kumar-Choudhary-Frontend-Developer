const DEFAULTS = Object.freeze({
  width: 1280,
  height: 720,
  fovDegrees: 42,
  orbitRadius: 2.04,
  fillRatio: 0.9,
});

function positiveOr(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Fits the complete orbit envelope into the available canvas without
 * changing the sphere's world-space radius or particle coordinates.
 */
export function getParticleCameraDistance({
  width,
  height,
  fovDegrees = DEFAULTS.fovDegrees,
  orbitRadius = DEFAULTS.orbitRadius,
  fillRatio = DEFAULTS.fillRatio,
} = {}) {
  const safeWidth = positiveOr(width, DEFAULTS.width);
  const safeHeight = positiveOr(height, DEFAULTS.height);
  const safeFov = Math.min(100, Math.max(10, positiveOr(fovDegrees, DEFAULTS.fovDegrees)));
  const safeRadius = positiveOr(orbitRadius, DEFAULTS.orbitRadius);
  const safeFill = Math.min(0.96, Math.max(0.5, positiveOr(fillRatio, DEFAULTS.fillRatio)));

  const aspect = safeWidth / safeHeight;
  const verticalHalfFov = (safeFov * Math.PI) / 360;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * aspect);
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);

  return safeRadius / (Math.tan(limitingHalfFov) * safeFill);
}
