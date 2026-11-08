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
  uniform float uSparkleChanceScale;
  uniform float uSparkleIntensity;
  uniform float uSparkleSizeScale;
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
    float recoveryVariation = hash11(aSeed * 7.13 + 2.8);
    float particleRecovery = uBurstRecoverySeconds
      * (uBurstRecoveryMin + recoveryVariation * uBurstRecoveryVariation);
    float burstAttack = smoothstep(0.0, uBurstOutwardSeconds, particleBurstTime);
    float burstRecovery = 1.0 - smoothstep(
      uBurstOutwardSeconds,
      uBurstOutwardSeconds + particleRecovery,
      particleBurstTime
    );
    float particleBurst = burstAttack * burstRecovery * sphereLayer;

    // Build a stable 3D impulse from the radial direction and two
    // perpendicular tangent axes. Radial motion dominates, while the
    // tangent components create organic depth and lateral scattering.
    float impulseSeed = aSeed * 91.7;
    vec3 randomAxis = normalize(vec3(
      sin(impulseSeed + 1.3),
      cos(impulseSeed * 0.79 + 2.7),
      sin(impulseSeed * 1.31 + 0.8)
    ));
    vec3 tangent = randomAxis - direction * dot(randomAxis, direction);

    if (length(tangent) < 0.001) {
      tangent = cross(direction, vec3(0.0, 1.0, 0.0));
    }

    tangent = normalize(tangent);
    vec3 bitangent = normalize(cross(direction, tangent));

    float radialVariation = 0.82 + hash11(aSeed * 19.73) * 0.36;
    float tangentVariation = 0.65
      + hash11(aSeed * 31.37 + 5.2) * uBurstTangentialVariation;
    float driftVariation = (hash11(aSeed * 47.11 + 9.4) * 2.0 - 1.0);

    float burstDistance = length(position)
      * uBurstExpansion
      * particleBurst
      * radialVariation;

    vec3 burstOffset = direction * burstDistance;
    burstOffset += tangent
      * burstDistance
      * uBurstTangentialStrength
      * tangentVariation;
    burstOffset += bitangent
      * burstDistance
      * uBurstDriftStrength
      * driftVariation;
    burstOffset.xy *= uBurstSpreadScale;
    transformed += burstOffset;

    // A local magnetic push affects only particles near the pointer hit.
    vec3 pointerDelta = transformed - uPointerPosition;
    float pointerDistance = length(pointerDelta);
    float pointerInfluence = 1.0 - smoothstep(0.06, 0.58, pointerDistance);
    vec3 pointerDirection = normalize(pointerDelta + vec3(0.0001));
    transformed += pointerDirection
      * pointerInfluence
      * 0.16
      * uPointerActive
      * sphereLayer;

    float microDrift = sin(uTime * 0.34 + aSeed * 6.28318)
      * 0.0035
      * uMotionEnabled;
    transformed += direction * microDrift;

    float ambientPhase = aSeed * 6.28318;
    vec3 ambientDrift = vec3(
      sin(uTime * 0.24 + ambientPhase),
      cos(uTime * 0.19 + ambientPhase * 1.31),
      sin(uTime * 0.17 + ambientPhase * 0.73)
    ) * 0.018 * ambientLayer * uMotionEnabled;
    transformed += ambientDrift;

    vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
    float viewDepth = max(1.0, -modelPosition.z);

    // Project the displacement to screen space so fragment trails align
    // with each particle's actual 3D travel direction.
    vec4 baseModelPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 baseClipPosition = projectionMatrix * baseModelPosition;
    vec4 displacedClipPosition = projectionMatrix * modelPosition;
    vec2 baseScreenPosition = baseClipPosition.xy / max(baseClipPosition.w, 0.0001);
    vec2 displacedScreenPosition = displacedClipPosition.xy
      / max(displacedClipPosition.w, 0.0001);
    vec2 screenTravel = displacedScreenPosition - baseScreenPosition;
    float screenTravelLength = length(screenTravel);
    vec2 projectedRadial = (projectionMatrix * modelViewMatrix * vec4(direction, 0.0)).xy;
    vTrailDirection = screenTravelLength > 0.00001
      ? screenTravel / screenTravelLength
      : normalize(projectedRadial + vec2(0.00001));
    vTrailStrength = clamp(
      particleBurst * smoothstep(0.018, 0.12, length(burstOffset)),
      0.0,
      1.0
    );

    vec3 viewNormal = normalize(mat3(modelViewMatrix) * direction);
    vec3 lightDirection = normalize(vec3(-0.46, 0.38, 0.82));
    float directionalLight = 0.50
      + 0.50 * max(dot(viewNormal, lightDirection), 0.0);
    float rimLight = pow(1.0 - abs(viewNormal.z), 2.1);
    float hemisphereFill = 0.24 + 0.76 * max(viewNormal.y * 0.5 + 0.5, 0.0);
    float facing = smoothstep(-0.24, 0.32, viewNormal.z);
    float surfaceOpacity = mix(uSurfaceParticleOpacityFloor, 0.96, facing);
    float layerOpacity = mix(surfaceOpacity, uInnerParticleOpacity, innerLayer);
    layerOpacity = mix(layerOpacity, uAmbientParticleOpacity, ambientLayer);

    // Separate near and far particles to strengthen volume without adding
    // geometry. Distant points become smaller, dimmer and more atmospheric.
    float normalizedViewDepth = clamp((viewDepth - 2.8) / 6.2, 0.0, 1.0);
    float depthLayer = smoothstep(0.12, 0.92, normalizedViewDepth);
    float nearParticleBoost = mix(1.12, 0.82, depthLayer);
    float depthAttenuation = 1.0 / (
      1.0 + max(0.0, viewDepth - 3.4) * 0.2
    );
    float depthFade = mix(1.0, 0.56, depthLayer) * depthAttenuation;

    // The interior gets a soft radial light falloff, while ambient particles
    // retain their own lower-opacity atmospheric palette.
    float normalizedRadius = clamp(
      length(position) / max(uSphereRadius, 0.001),
      0.0,
      1.0
    );
    float innerVolumeFalloff = exp(-normalizedRadius * 1.45);
    float volumeContribution = innerLayer
      * uVolumeIntensity
      * innerVolumeFalloff;
    vVolumeGlow = clamp(volumeContribution + (1.0 - depthLayer) * 0.12, 0.0, 1.0);

    // Sparkle frequency, phase, chance and intensity are independently
    // seeded, so points glint at different moments instead of flashing together.
    float sparkleRandom = hash11(aSeed * 113.17 + 17.3);
    float sparkleChance = clamp(
      mix(0.025, 0.16, sparkleRandom) * uSparkleChanceScale,
      0.0,
      0.32
    );
    float sparkleMask = step(1.0 - sparkleChance, hash11(aSeed * 37.0 + 3.9));
    float sparkleRate = 0.62 + hash11(aSeed * 17.4) * 2.1;
    float sparklePhase = aSeed * 31.4 + sparkleRandom * 6.28318;
    float sparkleWave = pow(
      max(0.0, sin(uTime * sparkleRate + sparklePhase)),
      14.0
    );
    float burstGlint = particleBurst * sparkleMask
      * (0.18 + sparkleRandom * 0.72);
    float sparkle = clamp(
      (sparkleMask * sparkleWave + burstGlint) * uSparkleIntensity * uMotionEnabled,
      0.0,
      1.0
    );

    float ambientSize = mix(uSurfaceParticleSizeScale, 1.18, ambientLayer);
    float burstSize = 1.0 + particleBurst * 0.85;

    gl_PointSize = clamp(
      aSize * ambientSize * burstSize * nearParticleBoost * uPixelRatio
        * (5.0 / viewDepth) * (1.0 + sparkle * 2.0 * uSparkleSizeScale),
      1.0,
      12.0 * uPixelRatio
    );

    gl_Position = displacedClipPosition;

    vec3 particleColor = mix(uBrandColor, aColor, uSurfaceParticleMix);
    particleColor = mix(particleColor, uVolumeColor, depthLayer * 0.22);
    particleColor = mix(particleColor, uInnerParticleColor, innerLayer);

    vec3 litColor = particleColor * (
      directionalLight * hemisphereFill + rimLight * 0.48
    );
    vec3 innerVolumeColor = mix(
      uInnerParticleColor,
      uVolumeColor,
      0.24 + innerVolumeFalloff * 0.34
    );
    vec3 innerLitColor = innerVolumeColor * (
      0.54 + hemisphereFill * 0.34 + innerVolumeFalloff * 0.22
    );
    vec3 ambientLitColor = uAmbientParticleColor
      * (0.66 + hemisphereFill * 0.24)
      * mix(1.0, 0.74, depthLayer);
    litColor = mix(litColor, innerLitColor, innerLayer);
    litColor = mix(litColor, ambientLitColor, ambientLayer);
    float surfaceBrightness = mix(
      uSurfaceParticleBrightness,
      1.0,
      max(innerLayer, ambientLayer)
    );
    litColor *= surfaceBrightness;
    vec3 sparkleColor = uSparkleColor * (0.7 + sparkle * 3.2);

    vColor = mix(litColor, sparkleColor, clamp(sparkle * 1.35, 0.0, 1.0));
    vColor *= 1.0 + sparkle * 3.4 + particleBurst * 0.22;
    vOpacity = (
      layerOpacity
      + sparkle * 1.15
      + particleBurst * 0.12
      + uBurst * 0.04 * sphereLayer
    ) * depthFade;
    vSparkle = sparkle;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;
  varying float vVolumeGlow;
  varying vec2 vTrailDirection;
  varying float vTrailStrength;

  void main() {
    vec2 centered = (gl_PointCoord - vec2(0.5)) * 2.0;
    float distanceFromCenter = length(centered);
    float alongTrail = dot(centered, vTrailDirection);
    vec2 perpendicular = vec2(-vTrailDirection.y, vTrailDirection.x);
    float acrossTrail = abs(dot(centered, perpendicular));

    float core = 1.0 - smoothstep(0.10, 0.88, distanceFromCenter);
    float halo = exp(-distanceFromCenter * distanceFromCenter * 6.2) * 0.24;
    float volumeHalo = exp(-distanceFromCenter * distanceFromCenter * 4.2)
      * vVolumeGlow
      * 0.34;
    float sparkleHalo = exp(-distanceFromCenter * distanceFromCenter * 4.8)
      * vSparkle
      * 1.05;

    // A tapered streak follows the projected movement direction and fades
    // behind the particle core. It remains inside the existing point sprite.
    float trailWidth = exp(-acrossTrail * 16.0);
    float trailLength = exp(-max(0.0, -alongTrail) * 3.4);
    float trailTail = step(alongTrail, 0.0)
      * trailWidth
      * trailLength
      * vTrailStrength
      * 0.48;

    float rayX = 1.0 - smoothstep(0.0, 0.04, abs(centered.x));
    float rayY = 1.0 - smoothstep(0.0, 0.04, abs(centered.y));
    float rayFade = 1.0 - smoothstep(0.08, 0.72, distanceFromCenter);
    float starRays = max(rayX, rayY) * rayFade * vSparkle * 0.58;

    float alpha = (
      core * 0.78
      + halo
      + volumeHalo
      + sparkleHalo
      + starRays
      + trailTail
    ) * vOpacity;

    if (alpha < 0.012) discard;

    vec3 trailColor = vColor * (0.78 + trailTail * 0.7);
    gl_FragColor = vec4(trailColor * (1.0 + vSparkle * 2.2), alpha);
  }
`;
