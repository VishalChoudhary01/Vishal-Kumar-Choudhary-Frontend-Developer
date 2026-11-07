const DEFAULT_PROFILE = Object.freeze({
  surfaceCount: 5200,
  innerCount: 620,
  ambientCount: 26,
  maxPixelRatio: 1.5,
  maxFps: 60,
  sparkleDensity: 1,
  sparkleIntensity: 0.9,
  sparkleSpeed: 0.36,
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

    if (isLowestTier) {
      return Object.freeze({
        surfaceCount: compactViewport ? 1600 : 2600,
        innerCount: compactViewport ? 140 : 300,
        ambientCount: compactViewport ? 6 : 12,
        maxPixelRatio: compactViewport ? 1.0 : 1.15,
        maxFps: 30,
        sparkleDensity: compactViewport ? 0.28 : 0.52,
        sparkleIntensity: compactViewport ? 0.3 : 0.55,
        sparkleSpeed: compactViewport ? 0.26 : 0.3,
        tier: "low",
      });
    }

    return Object.freeze({
      surfaceCount: compactViewport ? 2600 : 3200,
      innerCount: compactViewport ? 240 : 360,
      ambientCount: compactViewport ? 10 : 16,
      maxPixelRatio: compactViewport ? 1.1 : 1.2,
      maxFps: 40,
      sparkleDensity: compactViewport ? 0.42 : 0.72,
      sparkleIntensity: compactViewport ? 0.42 : 0.68,
      sparkleSpeed: compactViewport ? 0.3 : 0.32,
      tier: "compact",
    });
  }

  if (mediumViewport) {
    return Object.freeze({
      surfaceCount: 4000,
      innerCount: 460,
      ambientCount: 18,
      maxPixelRatio: 1.3,
      maxFps: 50,
      sparkleDensity: 0.86,
      sparkleIntensity: 0.82,
      sparkleSpeed: 0.34,
      tier: "medium",
    });
  }

  return Object.freeze({ ...DEFAULT_PROFILE, tier: "high" });
}

export function areParticleQualityProfilesEqual(left, right) {
  if (!left || !right) return false;

  return left.surfaceCount === right.surfaceCount
    && left.innerCount === right.innerCount
    && left.ambientCount === right.ambientCount
    && left.maxPixelRatio === right.maxPixelRatio
    && left.maxFps === right.maxFps
    && left.sparkleDensity === right.sparkleDensity
    && left.sparkleIntensity === right.sparkleIntensity
    && left.sparkleSpeed === right.sparkleSpeed
    && left.tier === right.tier;
}

export function hasParticleBudgetChanged(left, right) {
  if (!left || !right) return true;

  return left.surfaceCount !== right.surfaceCount
    || left.innerCount !== right.innerCount
    || left.ambientCount !== right.ambientCount;
}
