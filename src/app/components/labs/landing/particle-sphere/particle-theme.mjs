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
    particleColor: "#176b68",
    sparkleColor: "#00a293",
    glowColor: "#70bdb3",
    glowOpacity: 0.075,
    orbitOpacityScale: 0.92,
  });
}
