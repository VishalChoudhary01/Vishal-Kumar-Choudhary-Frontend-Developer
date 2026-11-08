export const particleVertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aLayer;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotionEnabled;
  uniform vec3 uBrandColor;
  uniform float uSurfaceParticleMix;
  uniform float uSurfaceParticleBrightness;
  uniform float uSurfaceParticleOpacityFloor;
  uniform float uSurfaceParticleSizeScale;
  uniform vec3 uInnerParticleColor;
  uniform float uInnerParticleOpacity;
  uniform vec3 uVolumeColor;
  uniform float uVolumeIntensity;
  uniform vec3 uAmbientParticleColor;
  uniform float uAmbientParticleOpacity;
  uniform float uSphereRadius;
  uniform vec3 uSparkleColor;
  uniform float uBurst;
  uniform float uBurstTime;
  uniform float uBurstExpansion;
  uniform vec2 uBurstSpreadScale;
  uniform float uBurstStagger;
  uniform float uBurstOutwardSeconds;
  uniform float uBurstRecoverySeconds;
  uniform float uBurstRecoveryMin;
  uniform float uBurstRecoveryVariation;
  uniform float uBurstTangentialStrength;
  uniform float uBurstTangentialVariation;
  uniform float uBurstDriftStrength;
  uniform vec3 uPointerPosition;
  uniform float uPointerActive;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;
  varying float vVolumeGlow;
  varying vec2 vTrailDirection;
  varying float vTrailStrength;

  float hash11(float value) {
    return fract(sin(value) * 43758.5453123);
  }

  void main() {
    vec3 transformed = position;
    vec3 direction = normalize(position + vec3(0.0001));

    float ambientLayer = step(1.5, aLayer);
    float innerLayer = step(0.5, aLayer) * (1.0 - ambientLayer);
    float sphereLayer = 1.0 - ambientLayer;

    // Each particle launches at a slightly different time and recovers at
    // its own rate. Its source position remains unchanged.
    float burstDelay = hash11(aSeed * 13.37 + 4.1) * uBurstStagger;
    float particleBurstTime = uBurstTime - burstDelay;
    float recoveryVariation = hash11(aSe...[truncated]