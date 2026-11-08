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
 * Fits an orbit envelope to either the complete viewport or a smaller
 * target rectangle while retaining the viewport's actual camera projection.
 */
export function getParticleCameraDistance({
  width,
  height,
  fovDegrees = DEFAULTS.fovDegrees,
  orbitRadius = DEFAULTS.orbitRadius,
  fillRatio = DEFAULTS.fillRatio,
  fitWidth = width,
  fitHeight = height,
} = {}) {
  const safeWidth = positiveOr(width, DEFAULTS.width);
  const safeHeight = positiveOr(height, DEFAULTS.height);
  const safeFov = Math.min(100, Math.max(10, positiveOr(fovDegrees, DEFAULTS.fovDegrees)));
  const safeRadius = positiveOr(orbitRadius, DEFAULTS.orbitRadius);
  const safeFill = Math.min(0.96, Math.max(0.5, positiveOr(fillRatio, DEFAULTS.fillRatio)));

  const safeFitWidth = positiveOr(fitWidth, safeWidth);
  const safeFitHeight = positiveOr(fitHeight, safeHeight);
  const verticalHalfFov = (safeFov * Math.PI) / 360;
  const focalLength = safeHeight / (2 * Math.tan(verticalHalfFov));
  const fitHalfSize = Math.min(safeFitWidth, safeFitHeight) / 2;

  return (focalLength * safeRadius) / (fitHalfSize * safeFill);
}


export function getParticleBurstSpreadScale(width, height) {
  const safeWidth = positiveOr(width, DEFAULTS.width);
  const safeHeight = positiveOr(height, DEFAULTS.height);
  const aspect = safeWidth / safeHeight;

  return aspect >= 1
    ? [aspect, 1]
    : [1, 1 / aspect];
}
