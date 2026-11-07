export function getParticleSphereThemePalette(isDark) {
  if (isDark) {
    return Object.freeze({
      particleColor: "#58b7ae",
      sparkleColor: "#e1fff9",
      glowColor: "#0c514b",
      glowOpacity: 0.055,
      orbitOpacityScale: 1,
    });
  }

  return Object.freeze({
    particleColor: "#103b37",
    sparkleColor: "#041816",
    glowColor: "#0a2926",
    glowOpacity: 0.09,
    orbitOpacityScale: 0.92,
  });
}
