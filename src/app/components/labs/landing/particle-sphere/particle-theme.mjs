export function getParticleSphereThemePalette(isDark) {
  if (isDark) {
    return Object.freeze({
      particleColor: "#58b7ae",
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
