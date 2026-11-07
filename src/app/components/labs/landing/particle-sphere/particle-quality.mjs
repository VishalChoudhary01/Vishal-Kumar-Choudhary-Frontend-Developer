const DEFAULT_PROFILE = Object.freeze({
  surfaceCount: 4400,
  innerCount: 480,
  ambientCount: 26,
  maxPixelRatio: 1.5,
});

function finitePositive(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Selects a bounded particle budget from viewport and device capabilities.
 * Missing device hints are treated as unknown, not as low-end hardware.
 */
export function getParticleQualityProfile({
  viewportWidth = 1280,
  deviceMemory = null,
  hardwareConcurrency = null,
} = {}) {
  const width = finitePositive(viewportWidth, 1280);
  const memory = finitePositive(deviceMemory, null);
  const cores = finitePositive(hardwareConcurrency, null);
  const compactViewport = width <= 640;
  const mediumViewport = width <= 1024;
  const constrainedDevice = (memory !== null && memory <= 4)
    || (cores !== null && cores <= 4);

  if (compactViewport || constrainedDevice) {
    const isLowestTier = constrainedDevice && (memory === null || memory <= 2 || cores <= 2);

    return Object.freeze({
      surfaceCount: compactViewport ? (isLowestTier ? 1800 : 2400) : 2800,
      innerCount: compactViewport ? (isLowestTier ? 160 : 220) : 280,
      ambientCount: compactViewport ? 8 : 12,
      maxPixelRatio: compactViewport ? 1.1 : 1.2,
      tier: isLowestTier ? "low" : "compact",
    });
  }

  if (mediumViewport) {
    return Object.freeze({
      surfaceCount: 3400,
      innerCount: 360,
      ambientCount: 18,
      maxPixelRatio: 1.3,
      tier: "medium",
    });
  }

  return Object.freeze({ ...DEFAULT_PROFILE, tier: "high" });
}
