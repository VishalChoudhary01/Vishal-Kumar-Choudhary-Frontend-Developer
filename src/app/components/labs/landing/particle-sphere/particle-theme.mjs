export function getParticleSphereThemePalette(isDark) {
  if (isDark) {
    return Object.freeze({
      particleColor: "#8ce8dc",
      surfaceParticleMix: 0.08,
      surfaceParticleBrightness: 1.45,
      surfaceParticleOpacityFloor: 0.1,
      surfaceParticleSizeScale: 1.16,
      innerParticleColor: "#8ae7d8",
      innerParticleOpacity: 0.88,
      volumeColor: "#56ccb9",
      volumeIntensity: 0.38,
      ambientParticleColor: "#9ceee0",
      ambientParticleOpacity: 0.62,
      sparkleColor: "#e1fff9",
      glowColor: "#061c18",
      glowOpacity: 0.028,
      orbitOpacityScale: 1,
      orbitParticleColor: "#e1fff9",
      orbitParticleGlowColor: "#69bdb9",
      orbitParticleOpacity: 0.96,
      orbitParticleGlowOpacity: 0.24,
    });
  }

  return Object.freeze({
    particleColor: "#103b37",
    surfaceParticleMix: 0.28,
    surfaceParticleBrightness: 1,
    surfaceParticleOpacityFloor: 0.012,
    surfaceParticleSizeScale: 1,
    innerParticleColor: "#0b2926",
    innerParticleOpacity: 0.58,
    volumeColor: "#17685e",
    volumeIntensity: 0.24,
    ambientParticleColor: "#326c62",
    ambientParticleOpacity: 0.42,
    sparkleColor: "#041816",
    glowColor: "#0a2926",
    glowOpacity: 0.09,
    orbitOpacityScale: 0.92,
    orbitParticleColor: "#041816",
    orbitParticleGlowColor: "#0a2926",
    orbitParticleOpacity: 0.9,
    orbitParticleGlowOpacity: 0.3,
  });
}
