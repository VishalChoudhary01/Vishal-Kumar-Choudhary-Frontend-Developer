const DEFAULTS = Object.freeze({
  width: 1280,
  height: 720,
  fovDegrees: 42,
  orbitRadius: 1.806,
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
  fitWidth = width,
  fitHeight = height,
} = {}) {
  const safeWidth = positiveOr(width, DEFAULTS.width);
  const safeHeight = positiveOr(height, DEFAULTS.height);
  const safeFitWidth = Math.min(safeWidth, positiveOr(fitWidth, safeWidth));
  const safeFitHeight = Math.min(safeHeight, positiveOr(fitHeight, safeHeight));
  const safeFov = Math.min(100, Math.max(10, positiveOr(fovDegrees, DEFAULTS.fovDegrees)));
  const safeRadius = positiveOr(orbitRadius, DEFAULTS.orbitRadius);
  const safeFill = Math.min(0.96, Math.max(0.5, positiveOr(fillRatio, DEFAULTS.fillRatio)));

  const aspect = safeWidth / safeHeight;
  const verticalHalfFov = (safeFov * Math.PI) / 360;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * aspect);
  const horizontalFitDistance = safeRadius / (
    Math.tan(horizontalHalfFov) * (safeFitWidth / safeWidth) * safeFill
  );
  const verticalFitDistance = safeRadius / (
    Math.tan(verticalHalfFov) * (safeFitHeight / safeHeight) * safeFill
  );

  return Math.max(horizontalFitDistance, verticalFitDistance);
}

/**
 * Measures the horizontal and vertical particle travel needed to reach the
 * farthest hero edges from the centered artwork figure.
 */
export function getParticleBurstSpreadScale({
  heroWidth,
  heroHeight,
  artworkWidth,
  artworkHeight,
  artworkOffsetX = 0,
  artworkOffsetY = 0,
} = {}) {
  const safeHeroWidth = positiveOr(heroWidth, DEFAULTS.width);
  const safeHeroHeight = positiveOr(heroHeight, DEFAULTS.height);
  const safeArtworkWidth = positiveOr(artworkWidth, safeHeroWidth);
  const safeArtworkHeight = positiveOr(artworkHeight, safeHeroHeight);
  const horizontalReach = safeHeroWidth / 2 + Math.abs(artworkOffsetX);
  const verticalReach = safeHeroHeight / 2 + Math.abs(artworkOffsetY);

  return [
    Math.min(5, Math.max(1, horizontalReach / (safeArtworkWidth / 2))),
    Math.min(5, Math.max(1, verticalReach / (safeArtworkHeight / 2))),
  ];
}

/**
 * Shifts the perspective projection center to the artwork figure while
 * keeping the camera optical axis aligned with the sphere center.
 */
export function getParticleCameraProjectionShift({
  width,
  height,
  offsetX = 0,
  offsetY = 0,
} = {}) {
  const safeWidth = positiveOr(width, DEFAULTS.width);
  const safeHeight = positiveOr(height, DEFAULTS.height);
  const safeOffsetX = Number.isFinite(offsetX) ? offsetX : 0;
  const safeOffsetY = Number.isFinite(offsetY) ? offsetY : 0;

  return {
    x: -(safeOffsetX * 2) / safeWidth,
    y: (safeOffsetY * 2) / safeHeight,
  };
}
